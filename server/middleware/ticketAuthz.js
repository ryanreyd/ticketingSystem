const Ticket = require("../models/ticketModel");
const ROLES = require("./roleConstants");

const can = (user, ticket, action) => {
  if (!user || !ticket || !action) return false;

  const isAdmin = user.role === ROLES.ADMIN;
  const isSupport = user.role === ROLES.SUPPORT;
  const isOwner = (ticket.createdBy._id || ticket.createdBy).toString() === user._id.toString();
  const isAssigned = ticket.assignedTo &&
    (ticket.assignedTo._id || ticket.assignedTo).toString() === user._id.toString();

  switch (action) {
    case "edit":
    case "change_status":
    case "change_priority":
      if (isAdmin) return true;
      if (isSupport && isAssigned) return true;
      if (isOwner) return true;
      return false;

    case "claim":
      if (!isAdmin && !isSupport) return false;
      if (ticket.assignedTo) return false;
      return true;

    case "resolve":
    case "reopen":
      if (isAdmin) return true;
      if (isOwner) return true;
      if (isSupport && isAssigned) return true;
      return false;

    case "close":
      if (isAdmin) return true;
      return false;

    default:
      return false;
  }
};

const ticketAuthz = (action) => {
  return async (req, res, next) => {
    try {
      const ticket = await Ticket.findById(req.params.id)
        .populate("createdBy", "fullname email role")
        .populate("assignedTo", "fullname email role");

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const allowed = can(req.user, ticket, action);

      if (!allowed) {
        if (
          action === "claim" &&
          (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPPORT) &&
          ticket.assignedTo
        ) {
          return res.status(409).json({
            message: "This ticket has already been claimed",
          });
        }
        return res.status(403).json({
          message: "Forbidden: insufficient rights for this action",
        });
      }

      req.ticket = ticket;
      next();
    } catch (err) {
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      next(err);
    }
  };
};

module.exports = { can, ticketAuthz };
