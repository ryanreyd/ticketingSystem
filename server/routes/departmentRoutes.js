const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getDepartments,
  createDepartment,
  updateDepartment,
} = require("../controllers/departmentController");

router.route("/")
  .get(getDepartments)
  .post(auth, role("admin"), createDepartment);

router.route("/:id")
  .put(auth, role("admin"), updateDepartment);

module.exports = router;
