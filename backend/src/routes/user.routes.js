import express from "express";
import { getUsers, createUser, updateUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Only ADMIN can perform these actions
router.get("/", authorizeRoles("ADMIN"), getUsers);
router.post("/", authorizeRoles("ADMIN"), createUser);
router.put("/:id", authorizeRoles("ADMIN"), updateUser);

export default router;
