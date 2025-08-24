const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getUsers,
  updateUser,
  getMe,
} = require("../controllers/userController");

router.use(auth);

router.route("/me").get(getMe);

router.route("/").get(role("admin"), getUsers);

router.route("/:id").put(role(["admin", "support"]), updateUser);

module.exports = router;
