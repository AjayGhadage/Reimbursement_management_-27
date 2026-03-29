import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔐 Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('Signup request:', { name, email, role });

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "EMPLOYEE"
    });

    const { password: _, ...safeUser } = user.toObject();

    console.log('User created with role:', safeUser.role);

    res.status(201).json({
      message: "User created",
      user: safeUser
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 🔐 Login - Security focused (no role revealing)
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
    
    // Generic error - don't reveal if email exists or role is wrong
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check role - but don't reveal why it failed
    if (user.role !== role) {
      console.log(`Role mismatch: User role ${user.role}, attempted role ${role}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // All validations passed
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...safeUser } = user.toObject();

    console.log('Login successful:', { email: safeUser.email, role: safeUser.role });

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};