const Ticket = require("../models/ticketModel");
const {
  createTicket,
  getTicketWithAccess,
  claimTicket,
  assignTicket,
  changeTicketStatus,
  changeTicketPriority,
  resolveTicket,
  reopenTicket,
  closeTicket,
  editTicket,
  getTicketLedger,
} = require("../services/ticketService");

exports.getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, page = 1, limit = 20, assignedTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const user = req.user;

    if (user.role === "user") {
      filter.createdBy = user._id;
    }

    if (assignedTo && user.role === "admin") {
      filter.assignedTo = assignedTo;
    }

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
    const ticket = await getTicketWithAccess(req.params.id, req.user);
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

    const ticket = await createTicket(
      { title, description, priority, category },
      req.user._id
    );

    const populated = await ticket.populate("createdBy", "fullname email");
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
    const updates = req.body;
    const ticket = await editTicket(req.params.id, req.user._id, updates);
    const populated = await ticket.populate([
      { path: "createdBy", select: "fullname email" },
      { path: "assignedTo", select: "fullname email" },
    ]);
    res.json(populated);
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

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.claimTicket = async (req, res, next) => {
  try {
    const ticket = await claimTicket(req.params.id, req.user);
    const populated = await ticket.populate("createdBy", "fullname email");
    res.json(populated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.assignTicket = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: "assignedTo is required" });
    }

    const ticket = await assignTicket(req.params.id, req.user._id, assignedTo);
    const populated = await ticket.populate("createdBy", "fullname email");
    res.json(populated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.changeTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const ticket = await changeTicketStatus(req.params.id, req.user._id, status);
    const populated = await ticket.populate([
      { path: "createdBy", select: "fullname email" },
      { path: "assignedTo", select: "fullname email" },
    ]);
    res.json(populated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.changeTicketPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({ message: "Priority is required" });
    }

    const ticket = await changeTicketPriority(req.params.id, req.user._id, priority);
    const populated = await ticket.populate([
      { path: "createdBy", select: "fullname email" },
      { path: "assignedTo", select: "fullname email" },
    ]);
    res.json(populated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.resolveTicket = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const ticket = await resolveTicket(req.params.id, req.user._id, resolution);
    const populated = await ticket.populate([
      { path: "createdBy", select: "fullname email" },
      { path: "assignedTo", select: "fullname email" },
    ]);
    res.json(populated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.reopenTicket = async (req, res, next) => {
  try {
    const ticket = await reopenTicket(req.params.id, req.user._id);
    const populated = await ticket.populate([
      { path: "createdBy", select: "fullname email" },
      { path: "assignedTo", select: "fullname email" },
    ]);
    res.json(populated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.closeTicket = async (req, res, next) => {
  try {
    const ticket = await closeTicket(req.params.id, req.user._id);
    const populated = await ticket.populate([
      { path: "createdBy", select: "fullname email" },
      { path: "assignedTo", select: "fullname email" },
    ]);
    res.json(populated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};

exports.getTicketLedger = async (req, res, next) => {
  try {
    const ledger = await getTicketLedger(req.params.id, req.user);
    res.json(ledger);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    next(err);
  }
};
