import ApprovalRule from "../models/approvalRule.model.js";
import User from "../models/user.model.js";

// ➤ Get company rule
export const getRule = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const rule = await ApprovalRule.findOne({ companyId: user.companyId });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Create or Update company rule (Admin only)
export const updateRule = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { name, steps, ruleType, percentageRequired, autoApproveRoles } = req.body;

    let rule = await ApprovalRule.findOne({ companyId: user.companyId });

    if (rule) {
      if (name) rule.name = name;
      if (steps) rule.steps = steps;
      if (ruleType) rule.ruleType = ruleType;
      if (percentageRequired !== undefined) rule.percentageRequired = percentageRequired;
      if (autoApproveRoles) rule.autoApproveRoles = autoApproveRoles;
      await rule.save();
    } else {
      rule = await ApprovalRule.create({
        name,
        steps,
        ruleType,
        percentageRequired,
        autoApproveRoles,
        companyId: user.companyId,
      });
    }

    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
