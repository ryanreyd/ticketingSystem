const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// GET all users
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

//get current loged user
exports.getMe = (req, res) => {
  res.json(req.user);
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    const { password, ...otherUpdates } = req.body;

    // If there's a password, hash it first
    if (password) {
      otherUpdates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, otherUpdates, {
      new: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
