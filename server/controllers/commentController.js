const Comment = require("../models/commentModel");
const Ticket = require("../models/ticketModel");
const ROLES = require("../middleware/roleConstants");

exports.getComments = async (req, res, next) => {
  try {
    const isAdminOrSupport = req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPPORT;
    const filter = { ticket: req.params.ticketId };

    if (!isAdminOrSupport) {
      filter.isInternal = { $ne: true };
    }

    const comments = await Comment.find(filter)
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
    const { content, isInternal } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const comment = await Comment.create({
      ticket: req.params.ticketId,
      author: req.user._id,
      content,
      isInternal: Boolean(isInternal),
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

    const isAdminOrSupport = req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPPORT;
    const isAuthor = comment.author.toString() === req.user._id.toString();

    if (comment.isInternal && !isAdminOrSupport) {
      return res.status(403).json({ message: "Forbidden: cannot delete internal comments" });
    }

    if (!isAuthor && !isAdminOrSupport) {
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
