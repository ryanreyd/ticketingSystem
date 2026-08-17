const User = require("../models/User");
const Department = require("../models/Department");
const Branch = require("../models/Branch");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require("libphonenumber-js");
const mongoose = require("mongoose");

exports.register = async (req, res, next) => {
  const {
    fullname,
    email,
    password,
    confirmPassword,
    departmentId,
    branchId,
    viberPhone,
  } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: "Fullname, email, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ message: "Password must contain a letter and a number" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  let department = null;
  if (departmentId) {
    if (!mongoose.isValidObjectId(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    department = await Department.findOne({ _id: departmentId, isActive: true });
    if (!department) {
      return res.status(400).json({ message: "Department not found or inactive" });
    }
  }

  let branch = null;
  if (branchId) {
    if (!mongoose.isValidObjectId(branchId)) {
      return res.status(400).json({ message: "Invalid branch ID" });
    }
    branch = await Branch.findOne({ _id: branchId, isActive: true });
    if (!branch) {
      return res.status(400).json({ message: "Branch not found or inactive" });
    }
  }

  let normalizedPhone = null;
  if (viberPhone) {
    try {
      const phone = parsePhoneNumber(viberPhone, "PH");
      if (!phone || !phone.isValid()) {
        return res.status(400).json({ message: "Invalid Viber phone number" });
      }
      normalizedPhone = phone.number;
    } catch {
      return res.status(400).json({ message: "Invalid Viber phone number format" });
    }
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullname,
      email,
      password: hashed,
      department: department?._id,
      branch: branch?._id,
      viberPhone: normalizedPhone,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const populated = await user.populate("department branch");

    res.status(201).json({
      message: "User registered",
      token,
      user: populated.toSafeObject(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    next(err);
  }
};

exports.getSetupStatus = async (req, res, next) => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    res.json({ setupComplete: !!adminExists });
  } catch (err) {
    next(err);
  }
};

exports.setup = async (req, res, next) => {
  const { fullname, email, password, confirmPassword } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: "Fullname, email, and password are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ message: "Password must contain a letter and a number" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(403).json({ message: "Setup already completed" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullname,
      email,
      password: hashed,
      role: "admin",
      department: null,
      branch: null,
      viberPhone: "",
    });

    // Override profileCompleted since pre-save hook sets it to false
    // due to missing department/branch/viberPhone
    await User.findByIdAndUpdate(user._id, { profileCompleted: true });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const populated = await user.populate("department branch");

    res.status(201).json({
      message: "Super admin created successfully",
      token,
      user: populated.toSafeObject(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const populated = await user.populate("department branch");

    res.json({
      token,
      user: populated.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};
