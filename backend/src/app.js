import express from "express";
import cors from "cors";
import expenseRoutes from "./routes/expense.routes.js";
import authRoutes from "./routes/auth.routes.js";
import approvalRuleRoutes from "./routes/approval.routes.js";

 

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/rules", approvalRuleRoutes);

app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

export default app;