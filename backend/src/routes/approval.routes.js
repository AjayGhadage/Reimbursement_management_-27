import express from "express";
import { getRule, updateRule } from "../controllers/approval.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Only ADMIN can update rules
router.get("/", authorizeRoles("ADMIN"), getRule);
router.post("/", authorizeRoles("ADMIN"), updateRule);
router.put("/", authorizeRoles("ADMIN"), updateRule);

export default router;