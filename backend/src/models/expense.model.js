import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["WAITING", "PENDING", "APPROVED", "REJECTED"],
    default: "WAITING"
  },
  step: Number,
  comment: String,
  approvedAt: Date
});

const expenseSchema = new mongoose.Schema({
  amount: Number,
  currency: String,

  convertedAmount: Number,   // Amount in company's default currency
  companyCurrency: String,   // Company's default currency

  category: String,
  description: String,
  date: Date,

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  approvals: [approvalSchema]  // 🔥 KEY FEATURE

}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);