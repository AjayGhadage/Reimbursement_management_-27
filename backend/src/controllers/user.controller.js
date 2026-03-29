import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ➤ Get all users for the current company
export const getUsers = async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || !adminUser.companyId) {
      return res.status(400).json({ message: "Admin is not associated with a company" });
    }

    const users = await User.find({ companyId: adminUser.companyId }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Create a user (Admin only)
export const createUser = async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || !adminUser.companyId) {
      return res.status(400).json({ message: "Admin is not associated with a company" });
    }

    const { name, email, password, role, managerId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "EMPLOYEE",
      companyId: adminUser.companyId,
      managerId: managerId || null
    });

    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Update a user role or manager
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, managerId } = req.body;

    const adminUser = await User.findById(req.userId);

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToUpdate.companyId.toString() !== adminUser.companyId.toString()) {
      return res.status(403).json({ message: "Cannot edit user outside your company" });
    }

    if (role) userToUpdate.role = role;
    if (managerId !== undefined) userToUpdate.managerId = managerId;

    await userToUpdate.save();

    const { password: _, ...safeUser } = userToUpdate.toObject();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
