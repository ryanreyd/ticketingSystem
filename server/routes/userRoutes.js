const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateProfile,
} = require("../controllers/userController");

router.use(auth);

router.route("/me").get(getMe);
router.route("/me/profile").put(updateProfile);
router.route("/").get(role(["admin", "support"]), getUsers).post(role("admin"), createUser);
router.route("/:id").put(role(["admin", "support"]), updateUser).delete(role("admin"), deleteUser);

module.exports = router;
