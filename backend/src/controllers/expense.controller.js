import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import ApprovalRule from "../models/approvalRule.model.js";
import Company from "../models/company.model.js";
import axios from "axios";


// ➤ Create Expense (with manager approval)
export const createExpense = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("companyId").populate("managerId");
    
    if (!user.companyId) {
      return res.status(400).json({ message: "User is not associated with a company" });
    }

    const rule = await ApprovalRule.findOne({ companyId: user.companyId });

    const approvals = [];
    
    if (rule && rule.steps && rule.steps.length > 0) {
      // Sort steps to ensure sequential order is handled by .order property
      const sortedSteps = [...rule.steps].sort((a, b) => a.order - b.order);

      for (let i = 0; i < sortedSteps.length; i++) {
        const step = sortedSteps[i];
        let approverIds = [];

        if (step.role === "MANAGER") {
          // Tier 1: Direct Manager from reporting hierarchy
          if (user.managerId && user.managerId._id) {
            approverIds.push(user.managerId._id);
          } else {
            // Tier 2: Fallback to all company managers if no direct boss
            const companyManagers = await User.find({ role: "MANAGER", companyId: user.companyId });
            approverIds = companyManagers.map(u => u._id);
          }
        } else {
          // Tier 3: Departmental / Role-based approvers (Finance, Director, etc.)
          const departmentalUsers = await User.find({ role: step.role, companyId: user.companyId });
          approverIds = departmentalUsers.map(u => u._id);
        }

        // De-duplicate in case of multiple roles/assignments
        const uniqueApproverIds = [...new Set(approverIds.map(id => id.toString()))];

        for (const approverId of uniqueApproverIds) {
          approvals.push({
            userId: approverId,
            step: step.order,
            // First step is PENDING, subsequent steps are WAITING in a SEQUENTIAL workflow
            status: (i === 0 || rule.ruleType !== "SEQUENTIAL") ? "PENDING" : "WAITING"
          });
        }
      }
    } else {
      // Emergency default: If no rules defined, require at least the direct or any manager
      const potentialApprovers = [];
      if (user.managerId) {
        potentialApprovers.push(user.managerId._id);
      } else {
        const anyManagers = await User.find({ role: "MANAGER", companyId: user.companyId });
        anyManagers.forEach(m => potentialApprovers.push(m._id));
      }

      potentialApprovers.forEach(id => {
        approvals.push({ userId: id, step: 1, status: "PENDING" });
      });
    }

    // Final de-duplication across the entire array for safety
    const uniqueApprovals = approvals.reduce((acc, current) => {
        const x = acc.find(item => item.userId.toString() === current.userId.toString() && item.step === current.step);
        if (!x) return acc.concat([current]);
        else return acc;
    }, []);

    // Ensure at least one approval stage exists (Safety Catch-All for Interconnection)
    if (uniqueApprovals.length === 0) {
        console.warn("⚠️ No hierarchical approvers found. Falling back to global company discovery...");
        const companyManagers = await User.find({ role: "MANAGER", companyId: user.companyId });
        
        if (companyManagers.length > 0) {
            companyManagers.forEach(m => {
                uniqueApprovals.push({ userId: m._id, step: 1, status: "PENDING" });
            });
        } else {
            // Ultimate fallback for dev/testing: Use ANY admin/manager in system if company is isolated
            const anyApprover = await User.findOne({ role: { $in: ["MANAGER", "ADMIN"] } });
            if (anyApprover) {
                uniqueApprovals.push({ userId: anyApprover._id, step: 1, status: "PENDING" });
            }
        }
    }

    const { amount, currency, description, date, category, remarks } = req.body;
    let convertedAmount = amount;
    const companyCurrency = user.companyId.baseCurrency || "USD";

    // ... Currency conversion logic ...
    if (currency && currency !== companyCurrency) {
      try {
        const exchangeRes = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        const rate = exchangeRes.data.rates[companyCurrency];
        if (rate) {
          convertedAmount = amount * rate;
          console.log(`💱 Exchange Sync: ${amount} ${currency} -> ${convertedAmount} ${companyCurrency}`);
        }
      } catch (err) {
        console.warn("⚠️ Exchange Rate API timeout. Using original amount.");
      }
    }

    const expense = await Expense.create({
      amount,
      currency,
      description: description || "New Expense",
      date: date || new Date(),
      category: category || "Other",
      remarks,
      convertedAmount,
      companyCurrency,
      createdBy: req.userId,
      approvals: uniqueApprovals
    });

    console.log("✅ Interconnected Workflow Triggered:", expense._id);
    res.status(201).json(expense);
  } catch (err) {
    console.error("🔥 Global Submission Error:", err);
    res.status(500).json({ error: "Workflow Sync Failure: Please refresh and try again." });
  }
};



// ➤ Get My Expenses
export const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ createdBy: req.userId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ➤ Get Pending Approvals (Manager)
export const getPendingApprovals = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Identity not verified." });

    // Security Isolation: Fetch all users in THIS company to filter discovery
    const companyUsers = await User.find({ companyId: user.companyId }).select("_id");
    const companyUserIds = companyUsers.map(u => u._id);

    // Fetch all pending tasks within the company context
    const expenses = await Expense.find({
        createdBy: { $in: companyUserIds },
        approvals: { $elemMatch: { status: "PENDING" } }
    }).populate("createdBy", "name email companyId")
      .sort({ createdAt: -1 });

    // Show everything to non-employees during this interconnection phase
    const filteredExpenses = (user.role === "EMPLOYEE") ? [] : expenses;

    console.log(`✅ Company Discovery: Showing ${filteredExpenses.length} tasks to ${user.role} (${user.companyId}).`);
    res.json(filteredExpenses); 
  } catch (err) {
    console.error("🔥 Approval Queue Error:", err);
    res.status(500).json({ message: "Discovery Service Failure: " + err.message });
  }
};


// ➤ Approve / Reject
export const updateApproval = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { action, comment } = req.body;

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found." });

    const approverUser = await User.findById(req.userId);
    if (!approverUser) return res.status(404).json({ message: "Approver not found in database." });

    console.log(`📡 Interconnected Processing: Expense ${expenseId} | User ${approverUser.name} (${approverUser.role})`);

    // 1. Identify the Task
    // First, try direct assignment
    let approvalIndex = expense.approvals.findIndex(
      (a) => a.userId?.toString() === req.userId && a.status === "PENDING"
    );

    // If no direct ID match, we check for departmental authority (Override)
    if (approvalIndex === -1) {
        console.log("🔍 Direct match failed. Checking Organizational Hierarchy...");
        const activeSteps = expense.approvals.filter(a => a.status === "PENDING");
        if (activeSteps.length > 0) {
            const rule = await ApprovalRule.findOne({ companyId: approverUser.companyId });
            if (rule) {
                const currentStepOrder = activeSteps[0].step;
                const ruleStep = rule.steps.find(s => s.order === currentStepOrder);
                
                // If user's role (e.g. Finance) matches the required role for THIS pending stage
                if (ruleStep && ruleStep.role === approverUser.role) {
                    console.log(`✅ Organization Override: User role ${approverUser.role} matches Step ${currentStepOrder}`);
                    approvalIndex = expense.approvals.findIndex(a => a.step === currentStepOrder && a.status === "PENDING");
                    if (approvalIndex !== -1) {
                        expense.approvals[approvalIndex].userId = req.userId; // Adopt task
                        console.log(`⚡ Task adopted at Index ${approvalIndex}`);
                    }
                } else {
                    console.warn(`❌ Identity Conflict: User is ${approverUser.role}, but Step ${currentStepOrder} needs ${ruleStep?.role}`);
                }
            } else {
                console.warn("⚠️ No Interconnected Rule found for this company.");
            }
        }
    }

    if (approvalIndex === -1) {
      return res.status(403).json({ message: "Action Forbidden: Access Denied for this stage." });
    }

    // 2. Finalize Current Stage
    const currentApproval = expense.approvals[approvalIndex];
    currentApproval.status = action;
    currentApproval.comment = comment;
    currentApproval.approvedAt = new Date();

    // Side-effect: If this was a multi-approver stage, mark others as completed
    expense.approvals.forEach(a => {
        if (a._id.toString() !== currentApproval._id.toString() && a.step === currentApproval.step) {
            if (a.status === "PENDING" || a.status === "WAITING") {
                a.status = action === "REJECTED" ? "REJECTED" : "APPROVED";
                a.comment = `Handled via ${approverUser.role} department overview (${approverUser.name}).`;
                a.approvedAt = new Date();
            }
        }
    });

    if (action === "REJECTED") {
      expense.status = "REJECTED";
      expense.markModified("approvals");
      await expense.save();
      return res.json({ message: "Workflow halted. Request Rejected.", expense });
    }

    // 3. Sequential Handoff
    const rule = await ApprovalRule.findOne({ companyId: approverUser.companyId });
    let isFullyApproved = false;

    if (!rule || rule.ruleType === "SEQUENTIAL") {
        const nextStepIndex = currentApproval.step + 1;
        const nextStepApprovals = expense.approvals.filter(a => a.step === nextStepIndex);

        if (nextStepApprovals.length === 0) {
          // INTERCONNECTED OVERRIDE: Before finalization, verify with company policy if more steps are needed
          const rule = await ApprovalRule.findOne({ companyId: approverUser.companyId });
          const expectedStep = rule?.steps.find(s => s.order === nextStepIndex);

          if (expectedStep) {
              console.log(`📡 Workflow Policy Detected: Auto-expanding to include missing Stage ${nextStepIndex} (${expectedStep.role})`);
              
              // Dynamically provision the missing stage
              const departmentalUsers = await User.find({ role: expectedStep.role, companyId: approverUser.companyId });
              departmentalUsers.forEach(u => {
                  expense.approvals.push({
                      userId: u._id,
                      step: nextStepIndex,
                      status: "PENDING"
                  });
              });
              
              // If no specific users found, add an empty role-based pointer for override discovery
              if (departmentalUsers.length === 0) {
                  expense.approvals.push({
                      step: nextStepIndex,
                      status: "PENDING"
                  });
              }
              isFullyApproved = false; // Prevent premature finalization
          } else {
              console.log("🏁 Stage chain reached finality based on policy.");
              isFullyApproved = true;
          }
        } else {
          console.log(`🔗 Triggering Handoff to existing Stage ${nextStepIndex}`);
          expense.approvals.forEach(a => {
            if (a.step === nextStepIndex) a.status = "PENDING";
          });
        }
    }

    if (isFullyApproved) {
      expense.status = "APPROVED";
      expense.approvals.forEach(a => {
        if (a.status === "WAITING") a.status = "APPROVED";
      });
    }

    expense.markModified("approvals");
    await expense.save();

    console.log("✅ Workflow state synchronized.");
    res.json({ 
        message: isFullyApproved ? "Request fully authorized." : "Approval recorded. Handoff complete.", 
        expense 
    });
  } catch (err) {
    console.error("🔥 Workflow Sync Error:", err);
    res.status(500).json({ message: "A server issue occurred: " + err.message });
  }
};

