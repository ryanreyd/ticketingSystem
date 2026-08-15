const Comment = require("../models/commentModel");
const Ticket = require("../models/ticketModel");

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ ticket: req.params.ticketId })
      .populate("author", "fullname email role")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const comment = await Comment.create({
      ticket: req.params.ticketId,
      author: req.user._id,
      content,
    });

    const populated = await comment.populate("author", "fullname email role");
    res.status(201).json(populated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (
      req.user.role !== "admin" &&
      comment.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden: can only delete own comments" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid comment ID" });
    }
    next(err);
  }
};
