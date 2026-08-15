const Ticket = require("../models/ticketModel");

exports.getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("createdBy", "fullname email")
        .populate("assignedTo", "fullname email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(filter),
    ]);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "fullname email")
      .populate("assignedTo", "fullname email");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      priority,
      category,
      createdBy: req.user._id,
    });

    const populated = await newTicket.populate("createdBy", "fullname email");
    res.status(201).json(populated);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const { title, description, status, priority, category, assignedTo } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (req.user.role === "user" && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: you can only update your own tickets" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (category !== undefined) updates.category = category;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;

    const updated = await Ticket.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "fullname email")
      .populate("assignedTo", "fullname email");

    res.json(updated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (req.user.role !== "admin" && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: you can only delete your own tickets" });
    }

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};
