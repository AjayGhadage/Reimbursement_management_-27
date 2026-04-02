import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["ADMIN", "MANAGER", "EMPLOYEE", "FINANCE", "DIRECTOR"],
    default: "EMPLOYEE"
  },

  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date

}, { timestamps: true });

export default mongoose.model("User", userSchema);