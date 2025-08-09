const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { getUsers, updateUser } = require("../controllers/userController");

router.use(auth);

router.route("/").get(getUsers);

router.route("/:id").put(updateUser);

module.exports = router;
