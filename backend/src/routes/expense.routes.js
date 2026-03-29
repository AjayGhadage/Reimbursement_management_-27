import express from "express";
import {
  createExpense,
  getMyExpenses,
  getPendingApprovals,
  updateApproval
} from "../controllers/expense.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createExpense);
router.get("/", authMiddleware, getMyExpenses);
router.get("/pending", authMiddleware, getPendingApprovals);
router.put("/:expenseId/approve", authMiddleware, updateApproval);

export default router;