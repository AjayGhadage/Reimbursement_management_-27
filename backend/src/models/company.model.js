import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  baseCurrency: { type: String, required: true }, // e.g., "USD", "INR"
}, { timestamps: true });

export default mongoose.model("Company", companySchema);
