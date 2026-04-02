import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Company from "../models/company.model.js";
import axios from "axios";
import crypto from "crypto";

// 🔐 Signup
export const signup = async (req, res) => {
  console.log(`📡 Incoming Signup: ${req.body.email} (${req.body.role})`);
  try {
    const { name, email, password, role: requestedRole, companyName, country } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine initial role and company association
    let role = requestedRole || "EMPLOYEE";
    let companyId = null;

    const userCount = await User.countDocuments();

    // EVERY user needs a companyId. Admins can create them, others join the first one.
    if (userCount === 0 || role === "ADMIN") {
      let activeCompany;
      const effectiveCompanyName = companyName || "My Organization";
      const effectiveCountry = country || "United States";

      activeCompany = await Company.findOne({ name: effectiveCompanyName });
      
      if (!activeCompany) {
        // Create a new company context
        let baseCurrency = "USD";
        try {
          // Attempt to get currency if country is provided
          const response = await axios.get(`https://restcountries.com/v3.1/name/${effectiveCountry}?fields=currencies`);
          if (response.data && response.data.length > 0) {
            baseCurrency = Object.keys(response.data[0].currencies)[0];
          }
        } catch (err) {
          console.error("Currency fetch failed, using USD");
        }

        activeCompany = await Company.create({
          name: effectiveCompanyName,
          country: effectiveCountry,
          baseCurrency
        });
      }
      companyId = activeCompany._id;
    } else {
      // Join the primary company context
      const fallbackCompany = await Company.findOne();
      if (fallbackCompany) {
        companyId = fallbackCompany._id;
      }
    }

    if (!companyId) {
      // Emergency fallback for first system run
      const emergencyCompany = await Company.create({ name: "ExpenseOS Global", country: "Global", baseCurrency: "USD" });
      companyId = emergencyCompany._id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyId
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({
      message: userCount === 0 ? "Account and Company context created successfully." : "Account created.",
      token,
      user: safeUser
    });
  } catch (err) {
    console.error("🔥 Signup Error:", err);
    res.status(500).json({ message: err.message || "An unexpected error occurred during signup." });
  }
};

// 🔐 Login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Safety Patch: Link orphan users to a company context if missing
    if (!user.companyId) {
      const fallback = await Company.findOne();
      if (fallback) {
        user.companyId = fallback._id;
        await user.save();
      } else {
        return res.status(400).json({ message: "Workspace not found. Contact system administrator." });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Role switching for demo/testing purposes
    if (role && user.role !== role) {
      user.role = role;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const { password: _, ...safeUser } = user.toObject();
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("🔥 Login Error:", err);
    res.status(500).json({ message: err.message || "An unexpected error occurred during login." });
  }
};


// 🔐 Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email address." });
    }

    // Generate hexadecimal reset token
    const token = crypto.randomBytes(20).toString("hex");

    // Hash token and set it to user schema with 1-hour expiry
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    console.log(`🔑 Reset Link Triggered for ${email}: \n [DEBUG] TOKEN: ${token}`);
    
    // In production, we'd send an actual email here using nodemailer
    res.json({ 
        message: "A password reset token has been generated. For this demo, please check the server logs.",
        debugToken: process.env.NODE_ENV !== "production" ? token : undefined 
    });
  } catch (err) {
    console.error("🔥 Reset Trigger Error:", err);
    res.status(500).json({ message: "Recovery service unavailable." });
  }
};

// 🔐 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Success! Your password has been updated." });
  } catch (err) {
    console.error("🔥 Reset Completion Error:", err);
    res.status(500).json({ message: "Failed to update password." });
  }
};