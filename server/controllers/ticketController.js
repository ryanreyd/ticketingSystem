const Ticket = require("../models/ticketModel");

// GET all tickets
exports.getTickets = async (req, res) => {
  const tickets = await Ticket.find().populate("createdBy", "fullname");
  if (!tickets) return res.status(404).json({ message: "Ticket not found" });
  res.json(tickets);
};

// GET one ticket
exports.getTicketById = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  res.json(ticket);
};

// CREATE ticket
exports.createTicket = async (req, res) => {
  const newTicket = await Ticket.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json(newTicket);
};

// UPDATE ticket
exports.updateTicket = async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  res.json(ticket);
};

// DELETE ticket
exports.deleteTicket = async (req, res) => {
  const ticket = await Ticket.findByIdAndDelete(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  res.json({ message: "Ticket deleted" });
};
