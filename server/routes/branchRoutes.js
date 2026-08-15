const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getBranches,
  createBranch,
  updateBranch,
} = require("../controllers/branchController");

router.route("/")
  .get(getBranches)
  .post(auth, role("admin"), createBranch);

router.route("/:id")
  .put(auth, role("admin"), updateBranch);

module.exports = router;
