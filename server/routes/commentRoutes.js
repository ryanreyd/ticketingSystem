const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getComments,
  createComment,
  deleteComment,
} = require("../controllers/commentController");

router.use(auth);

router.route("/")
  .get(getComments)
  .post(createComment);

router.route("/:id")
  .delete(deleteComment);

module.exports = router;
