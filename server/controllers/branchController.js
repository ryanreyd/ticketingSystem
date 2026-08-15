const Branch = require("../models/Branch");

exports.getBranches = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};

    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const branches = await Branch.find(filter).sort({ name: 1 });
    res.json(branches);
  } catch (err) {
    next(err);
  }
};

exports.createBranch = async (req, res, next) => {
  try {
    const { name, code, isActive } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const branch = await Branch.create({ name, code, isActive });
    res.status(201).json(branch);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Branch code already exists" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const { name, code, isActive } = req.body;

    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    if (name !== undefined) branch.name = name;
    if (code !== undefined) branch.code = code;
    if (isActive !== undefined) branch.isActive = isActive;

    await branch.save();
    res.json(branch);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Branch code already exists" });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid branch ID" });
    }
    next(err);
  }
};
