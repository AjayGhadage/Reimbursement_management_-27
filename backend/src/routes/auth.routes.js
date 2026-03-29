import express from "express";
import { signup, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Add a test GET route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

export default router;