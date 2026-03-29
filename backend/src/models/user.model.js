import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["ADMIN", "MANAGER", "EMPLOYEE", "FINANCE", "DIRECTOR"],
    default: "EMPLOYEE"
  },

  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);