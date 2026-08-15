const Department = require("../models/Department");

exports.getDepartments = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};

    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const departments = await Department.find(filter).sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, isActive } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const dept = await Department.create({ name, code, isActive });
    res.status(201).json(dept);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Department code already exists" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, code, isActive } = req.body;

    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    if (name !== undefined) dept.name = name;
    if (code !== undefined) dept.code = code;
    if (isActive !== undefined) dept.isActive = isActive;

    await dept.save();
    res.json(dept);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Department code already exists" });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    next(err);
  }
};
