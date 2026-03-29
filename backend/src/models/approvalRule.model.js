import mongoose from "mongoose";

const approvalRuleSchema = new mongoose.Schema({
  name: String,

  steps: [
    {
      role: {
        type: String,
        enum: ["MANAGER", "FINANCE", "DIRECTOR"]
      },
      order: Number
    }
  ]

}, { timestamps: true });

export default mongoose.model("ApprovalRule", approvalRuleSchema);