import mongoose from "mongoose";

const approvalRuleSchema = new mongoose.Schema({
  name: String,
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  steps: [
    {
      role: {
        type: String,
        enum: ["MANAGER", "FINANCE", "DIRECTOR"]
      },
      order: Number
    }
  ],

  ruleType: {
    type: String,
    enum: ["SEQUENTIAL", "PERCENTAGE", "SPECIFIC_APPROVER", "HYBRID"],
    default: "SEQUENTIAL"
  },

  percentageRequired: {
    type: Number,
    min: 1,
    max: 100,
    default: 100 // Default 100% means all generic sequential approvals needed 
  },

  autoApproveRoles: [
    {
      type: String,
      enum: ["MANAGER", "FINANCE", "DIRECTOR"]
    }
  ]

}, { timestamps: true });

export default mongoose.model("ApprovalRule", approvalRuleSchema);