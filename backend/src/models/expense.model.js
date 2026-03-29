import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },
  step: Number,
  comment: String
});

const expenseSchema = new mongoose.Schema({
  amount: Number,
  currency: String,
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