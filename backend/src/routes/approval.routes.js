import express from "express";
import ApprovalRule from "../models/approvalRule.model.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create / Update (single default rule)
router.post("/", authMiddleware, async (req, res) => {
  const { name, steps } = req.body;

  let rule = await ApprovalRule.findOne();
  if (rule) {
    rule.name = name;
    rule.steps = steps;
    await rule.save();
  } else {
    rule = await ApprovalRule.create({ name, steps });
  }

  res.json(rule);
});

// Get rule
router.get("/", authMiddleware, async (req, res) => {
  const rule = await ApprovalRule.findOne();
  res.json(rule);
});

export default router;