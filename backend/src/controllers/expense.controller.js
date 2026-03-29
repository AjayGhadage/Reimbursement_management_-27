import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import ApprovalRule from "../models/approvalRule.model.js";
import Company from "../models/company.model.js";
import axios from "axios";


// ➤ Create Expense (with manager approval)
export const createExpense = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("companyId");
    
    if (!user.companyId) {
      return res.status(400).json({ message: "User is not associated with a company" });
    }

    const rule = await ApprovalRule.findOne({ companyId: user.companyId });

    const approvals = [];
    
    if (rule && rule.steps && rule.steps.length > 0) {
      const sortedSteps = rule.steps.sort((a, b) => a.order - b.order);

      for (let i = 0; i < sortedSteps.length; i++) {
        const step = sortedSteps[i];
        let approverIds = [];

        if (step.role === "MANAGER") {
          if (user.managerId) {
            approverIds.push(user.managerId);
          }
        } else {
          const found = await User.find({ role: step.role, companyId: user.companyId });
          approverIds = found.map(u => u._id);
        }

        for (const approverId of approverIds) {
          approvals.push({
            userId: approverId,
            step: step.order,
            status: (i === 0 || rule.ruleType !== "SEQUENTIAL") ? "PENDING" : "WAITING"
          });
        }
      }
    } else {
      // Fallback: If no rules defined, require immediate manager approval
      if (user.managerId) {
        approvals.push({
          userId: user.managerId,
          step: 1,
          status: "PENDING"
        });
      }
    }


    const { amount, currency, description, date, category, remarks } = req.body;
    let convertedAmount = amount;
    const companyCurrency = user.companyId.baseCurrency || "USD";

    if (currency && currency !== companyCurrency) {
      try {
        const exchangeRes = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        const rate = exchangeRes.data.rates[companyCurrency];
        if (rate) {
          convertedAmount = amount * rate;
          console.log(`💱 Converted: ${amount} ${currency} -> ${convertedAmount} ${companyCurrency}`);
        }
      } catch (err) {
        console.warn("⚠️ Currency API failed. Using base amount:", err.message);
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
      approvals
    });

    console.log("✅ Expense Created Successfully:", expense._id);
    res.status(201).json(expense);

  } catch (err) {
    console.error("🔥 Error in createExpense:", err.stack);
    res.status(500).json({ error: "Failed to process expense. Please try again." });
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
    const expenses = await Expense.find({
      approvals: {
        $elemMatch: {
          userId: req.userId,
          status: "PENDING"
        }
      }
    });

    res.json(expenses);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ➤ Approve / Reject
export const updateApproval = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { action, comment } = req.body;

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Ensure the user actually has a pending approval
    const approval = expense.approvals.find(
      (a) => a.userId.toString() === req.userId && a.status === "PENDING"
    );
    if (!approval) return res.status(400).json({ message: "No pending approval" });

    // Process logic
    approval.status = action;
    approval.comment = comment;
    approval.approvedAt = new Date();

    if (action === "REJECTED") {
      expense.status = "REJECTED";
      await expense.save();
      return res.json({ message: "Expense rejected", expense });
    }

    // It was APPROVED by this user.
    // Fetch the approver's user to get their role and company.
    const approverUser = await User.findById(req.userId);
    const rule = await ApprovalRule.findOne({ companyId: approverUser.companyId });

    let isFullyApproved = false;

    // Evaluate conditional rules if defined
    if (rule) {
      if (
        (rule.ruleType === "SPECIFIC_APPROVER" || rule.ruleType === "HYBRID") &&
        rule.autoApproveRoles &&
        rule.autoApproveRoles.includes(approverUser.role)
      ) {
        isFullyApproved = true;
      }

      if (
        !isFullyApproved &&
        (rule.ruleType === "PERCENTAGE" || rule.ruleType === "HYBRID")
      ) {
        const approvedCount = expense.approvals.filter((a) => a.status === "APPROVED").length;
        const totalSteps = expense.approvals.length;
        const currentPercentage = (approvedCount / totalSteps) * 100;

        if (currentPercentage >= rule.percentageRequired) {
          isFullyApproved = true;
        }
      }
    }

    // Default Sequential behavior
    if (!isFullyApproved) {
      if (!rule || rule.ruleType === "SEQUENTIAL") {
        // Find next step's approvals
        const nextStepIndex = approval.step + 1;
        const nextStepApprovals = expense.approvals.filter(a => a.step === nextStepIndex);

        if (nextStepApprovals.length === 0) {
          isFullyApproved = true; // No more steps
        } else {
          // Progress to next step: set all within that step to PENDING
          nextStepApprovals.forEach(a => {
            if (a.status === "WAITING") a.status = "PENDING";
          });
        }
      } else {
        // For other non-sequential rules that haven't hit threshold/auto-approval yet,
        // we just stay in pending status overall until threshold is reached.
      }
    }

    if (isFullyApproved) {
      expense.status = "APPROVED";
      // Auto-approve remaining steps virtually
      expense.approvals.forEach((a) => {
        if (a.status === "PENDING" || a.status === "WAITING") {
          a.status = "APPROVED";
          a.comment = "Auto-approved via conditional rule";
        }
      });
    }

    await expense.save();
    res.json({ message: "Updated", expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

