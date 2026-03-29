import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Company from "../models/company.model.js";
import axios from "axios";

// 🔐 Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, companyName, country } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if it's the first user -> auto-make them ADMIN
    const userCount = await User.countDocuments();
    let role = "EMPLOYEE";
    let companyId = null;

    if (userCount === 0) {
      if (!companyName || !country) {
        return res.status(400).json({ message: "Company name and country are required for the first user to create a company." });
      }

      // Fetch country currency
      let baseCurrency = "USD"; // fallback
      try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${country}?fields=name,currencies`);
        if (response.data && response.data.length > 0) {
          const currenciesString = Object.keys(response.data[0].currencies)[0];
          baseCurrency = currenciesString;
        }
      } catch (err) {
        console.error("Failed to fetch currency:", err.message);
      }

      const newCompany = await Company.create({
        name: companyName,
        country: country,
        baseCurrency: baseCurrency
      });

      companyId = newCompany._id;
      role = "ADMIN";
    } else {
      // Assign non-first users to the existing company automatically
      const existingCompany = await Company.findOne();
      if (existingCompany) {
        companyId = existingCompany._id;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyId
    });

    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({
      message: userCount === 0 ? "First user and company created successfully as Admin" : "User created",
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};