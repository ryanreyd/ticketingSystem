const User = require("../models/User");
const Department = require("../models/Department");
const Branch = require("../models/Branch");
const bcrypt = require("bcrypt");
const { parsePhoneNumber } = require("libphonenumber-js");
const mongoose = require("mongoose");

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, department, branch, search } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (branch) filter.branch = branch;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ fullname: regex }, { email: regex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("department", "name code")
        .populate("branch", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("department", "name code")
      .populate("branch", "name code");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullname, departmentId, branchId, viberPhone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullname !== undefined) user.fullname = fullname;

    if (departmentId !== undefined) {
      if (departmentId) {
        if (!mongoose.isValidObjectId(departmentId)) {
          return res.status(400).json({ message: "Invalid department ID" });
        }
        const dept = await Department.findOne({ _id: departmentId, isActive: true });
        if (!dept) {
          return res.status(400).json({ message: "Department not found or inactive" });
        }
        user.department = dept._id;
      } else {
        user.department = undefined;
      }
    }

    if (branchId !== undefined) {
      if (branchId) {
        if (!mongoose.isValidObjectId(branchId)) {
          return res.status(400).json({ message: "Invalid branch ID" });
        }
        const br = await Branch.findOne({ _id: branchId, isActive: true });
        if (!br) {
          return res.status(400).json({ message: "Branch not found or inactive" });
        }
        user.branch = br._id;
      } else {
        user.branch = undefined;
      }
    }

    if (viberPhone !== undefined) {
      if (viberPhone) {
        try {
          const phone = parsePhoneNumber(viberPhone, "PH");
          if (!phone || !phone.isValid()) {
            return res.status(400).json({ message: "Invalid Viber phone number" });
          }
          user.viberPhone = phone.number;
        } catch {
          return res.status(400).json({ message: "Invalid Viber phone number format" });
        }
      } else {
        user.viberPhone = undefined;
      }
    }

    await user.save();
    const populated = await user.populate("department branch");
    res.json(populated.toSafeObject());
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { fullname, email, password, role, departmentId, branchId, viberPhone, isActive } = req.body;

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (req.user.role === "support" && targetUser.role === "admin") {
      return res.status(403).json({ message: "Forbidden: cannot modify admin users" });
    }

    if (req.user.role === "support" && role && role !== targetUser.role) {
      return res.status(403).json({ message: "Forbidden: support cannot change roles" });
    }

    if (fullname !== undefined) targetUser.fullname = fullname;
    if (email !== undefined) targetUser.email = email;

    if (departmentId !== undefined) {
      if (departmentId) {
        if (!mongoose.isValidObjectId(departmentId)) {
          return res.status(400).json({ message: "Invalid department ID" });
        }
        const dept = await Department.findOne({ _id: departmentId, isActive: true });
        if (!dept) {
          return res.status(400).json({ message: "Department not found or inactive" });
        }
        targetUser.department = dept._id;
      } else {
        targetUser.department = undefined;
      }
    }

    if (branchId !== undefined) {
      if (branchId) {
        if (!mongoose.isValidObjectId(branchId)) {
          return res.status(400).json({ message: "Invalid branch ID" });
        }
        const br = await Branch.findOne({ _id: branchId, isActive: true });
        if (!br) {
          return res.status(400).json({ message: "Branch not found or inactive" });
        }
        targetUser.branch = br._id;
      } else {
        targetUser.branch = undefined;
      }
    }

    if (viberPhone !== undefined) {
      if (viberPhone) {
        try {
          const phone = parsePhoneNumber(viberPhone, "PH");
          if (!phone || !phone.isValid()) {
            return res.status(400).json({ message: "Invalid Viber phone number" });
          }
          targetUser.viberPhone = phone.number;
        } catch {
          return res.status(400).json({ message: "Invalid Viber phone number format" });
        }
      } else {
        targetUser.viberPhone = undefined;
      }
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      targetUser.password = await bcrypt.hash(password, 12);
    }

    if (role !== undefined && req.user.role === "admin") {
      targetUser.role = role;
    }

    if (isActive !== undefined && req.user.role === "admin") {
      if (targetUser._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot deactivate your own account" });
      }
      targetUser.isActive = isActive;
    }

    await targetUser.save();
    const populated = await targetUser.populate("department branch");
    res.json(populated.toSafeObject());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const {
      fullname,
      email,
      password,
      role = "user",
      departmentId,
      branchId,
      viberPhone,
    } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "Fullname, email, and password are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
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

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullname,
      email,
      password: hashed,
      role,
      department: department?._id,
      branch: branch?._id,
      viberPhone: normalizedPhone,
    });

    const populated = await user.populate("department branch");
    res.status(201).json(populated.toSafeObject());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    if (targetUser.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin user" });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    next(err);
  }
};
