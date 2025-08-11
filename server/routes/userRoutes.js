const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getUsers,
  updateUser,
  getMe,
} = require("../controllers/userController");

router.use(auth);

router.route("/me").get(getMe);

router.route("/").get(getUsers);

router.route("/:id").put(updateUser);

module.exports = router;
