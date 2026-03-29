import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import ApprovalRule from "../models/approvalRule.model.js";


// ➤ Create Expense (with manager approval)
export const createExpense = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const rule = await ApprovalRule.findOne(); // default rule

    const approvals = [];

    for (const step of rule.steps.sort((a, b) => a.order - b.order)) {
      let approver = null;

      if (step.role === "MANAGER") {
        approver = user.managerId;
      } else {
        const found = await User.findOne({ role: step.role });
        approver = found?._id;
      }

      if (approver) {
        approvals.push({
          userId: approver,
          step: step.order,
          status: "PENDING"
        });
      }
    }

    const expense = await Expense.create({
      ...req.body,
      createdBy: req.userId,
      approvals
    });

    res.status(201).json(expense);

  } catch (err) {
    res.status(500).json({ error: err.message });
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

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const approval = expense.approvals.find(
      a =>
        a.userId.toString() === req.userId &&
        a.status === "PENDING"
    );

    if (!approval) {
      return res.status(400).json({ message: "No pending approval" });
    }

    // Update current approval
    approval.status = action;
    approval.comment = comment;

    if (action === "REJECTED") {
      expense.status = "REJECTED";
    } else {
      const nextStep = expense.approvals.find(
        a => a.step === approval.step + 1
      );

      if (!nextStep) {
        expense.status = "APPROVED";
      }
    }

    await expense.save();

    res.json({ message: "Updated", expense });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

