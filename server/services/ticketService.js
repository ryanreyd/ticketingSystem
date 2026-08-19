const mongoose = require("mongoose");
const Ticket = require("../models/ticketModel");
const TicketLedger = require("../models/ticketLedgerModel");
const User = require("../models/User");

const ticketNumberPrefix = "TKT";

const generateTicketNumber = async () => {
  const count = await Ticket.countDocuments();
  const seq = count + 1;
  return `${ticketNumberPrefix}-${String(seq).padStart(5, "0")}`;
};

const createLedgerEntry = async ({
  ticketId,
  actorId,
  action,
  field,
  oldValue,
  newValue,
  description,
  session,
}) => {
  const entry = new TicketLedger({
    ticketId,
    actorId,
    action,
    field,
    oldValue,
    newValue,
    description,
  });

  if (session) {
    await entry.save({ session });
  } else {
    await entry.save();
  }
};

const getTicketWithAccess = async (ticketId, user) => {
  const ticket = await Ticket.findById(ticketId)
    .populate({
      path: "createdBy",
      select: "fullname email role branch department",
      populate: [
        { path: "branch", select: "name code" },
        { path: "department", select: "name code" },
      ],
    })
    .populate({
      path: "assignedTo",
      select: "fullname email role branch department",
      populate: [
        { path: "branch", select: "name code" },
        { path: "department", select: "name code" },
      ],
    });

  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (user.role === "admin") return ticket;

  if (ticket.createdBy._id.toString() === user._id.toString()) return ticket;

  if (user.role === "support") return ticket;

  const err = new Error("Forbidden: insufficient rights");
  err.status = 403;
  throw err;
};

const claimTicket = async (ticketId, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    if (ticket.assignedTo) {
      const err = new Error("This ticket has already been claimed");
      err.status = 409;
      throw err;
    }

    if (ticket.status === "closed" || ticket.status === "resolved") {
      const err = new Error("Cannot claim a resolved or closed ticket");
      err.status = 400;
      throw err;
    }

    const previousStatus = ticket.status;

    ticket.assignedTo = user._id;
    ticket.claimedAt = new Date();

    if (ticket.status === "open") {
      ticket.status = "in_progress";
    }

    await ticket.save({ session });

    await createLedgerEntry({
      ticketId: ticket._id,
      actorId: user._id,
      action: "claimed",
      description: `${user.fullname} claimed this ticket.`,
      session,
    });

    if (previousStatus !== ticket.status) {
      await createLedgerEntry({
        ticketId: ticket._id,
        actorId: user._id,
        action: "status_changed",
        field: "status",
        oldValue: previousStatus,
        newValue: ticket.status,
        description: `Status changed ${previousStatus} → ${ticket.status}`,
        session,
      });
    }

    await session.commitTransaction();
    session.endSession();

    return ticket;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const assignTicket = async (ticketId, actorId, assignedToId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    const assignee = await User.findById(assignedToId).session(session);
    if (!assignee || (assignee.role !== "support" && assignee.role !== "admin")) {
      const err = new Error("Assignee must be support staff or admin");
      err.status = 400;
      throw err;
    }

    ticket.assignedTo = assignedToId;
    if (!ticket.claimedAt) {
      ticket.claimedAt = new Date();
    }

    await ticket.save({ session });

    await createLedgerEntry({
      ticketId: ticket._id,
      actorId,
      action: "assigned",
      description: `${(await User.findById(actorId).session(session).select("fullname")).fullname} assigned this ticket to ${assignee.fullname}.`,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return ticket;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const changeTicketStatus = async (ticketId, actorId, newStatus) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    const previousStatus = ticket.status;

    if (previousStatus === newStatus) {
      const err = new Error("Status is already set to this value");
      err.status = 400;
      throw err;
    }

    const allowedTransitions = {
      open: ["in_progress", "pending", "closed"],
      in_progress: ["pending", "resolved", "closed", "reopened"],
      pending: ["in_progress", "resolved", "closed"],
      reopened: ["in_progress", "pending", "resolved", "closed"],
      resolved: ["closed", "reopened"],
      closed: ["reopened"],
    };

    const allowed = allowedTransitions[previousStatus] || [];
    if (!allowed.includes(newStatus)) {
      const err = new Error(`Invalid status transition from ${previousStatus} to ${newStatus}`);
      err.status = 400;
      throw err;
    }

    ticket.status = newStatus;

    if (newStatus === "resolved") {
      ticket.resolvedAt = new Date();
    }
    if (newStatus === "closed") {
      ticket.closedAt = new Date();
    }
    if (newStatus === "reopened") {
      ticket.resolvedAt = undefined;
      ticket.closedAt = undefined;
    }

    await ticket.save({ session });

    await createLedgerEntry({
      ticketId: ticket._id,
      actorId,
      action: "status_changed",
      field: "status",
      oldValue: previousStatus,
      newValue: newStatus,
      description: `Status changed ${previousStatus} → ${newStatus}`,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return ticket;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const changeTicketPriority = async (ticketId, actorId, newPriority) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    const previousPriority = ticket.priority;

    if (previousPriority === newPriority) {
      const err = new Error("Priority is already set to this value");
      err.status = 400;
      throw err;
    }

    ticket.priority = newPriority;
    await ticket.save({ session });

    await createLedgerEntry({
      ticketId: ticket._id,
      actorId,
      action: "priority_changed",
      field: "priority",
      oldValue: previousPriority,
      newValue: newPriority,
      description: `Priority changed ${previousPriority} → ${newPriority}`,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return ticket;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const resolveTicket = async (ticketId, actorId, resolution) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    if (ticket.status === "closed") {
      const err = new Error("Cannot resolve a closed ticket");
      err.status = 400;
      throw err;
    }

    const previousStatus = ticket.status;

    ticket.status = "resolved";
    ticket.resolvedAt = new Date();
    ticket.resolution = resolution || "";

    await ticket.save({ session });

    await createLedgerEntry({
      ticketId: ticket._id,
      actorId,
      action: "resolved",
      field: "status",
      oldValue: previousStatus,
      newValue: "resolved",
      description: `${(await User.findById(actorId).session(session).select("fullname")).fullname} resolved this ticket.`,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return ticket;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const reopenTicket = async (ticketId, actorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    const previousStatus = ticket.status;

    if (previousStatus !== "resolved" && previousStatus !== "closed") {
      const err = new Error("Only resolved or closed tickets can be reopened");
      err.status = 400;
      throw err;
    }

    ticket.status = "reopened";
    ticket.resolvedAt = undefined;
    ticket.closedAt = undefined;

    await ticket.save({ session });

    await createLedgerEntry({
      ticketId: ticket._id,
      actorId,
      action: "reopened",
      field: "status",
      oldValue: previousStatus,
      newValue: "reopened",
      description: `${(await User.findById(actorId).session(session).select("fullname")).fullname} reopened this ticket.`,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return ticket;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const closeTicket = async (ticketId, actorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    if (ticket.status === "closed") {
      const err = new Error("Ticket is already closed");
      err.status = 400;
      throw err;
    }

    const previousStatus = ticket.status;

    ticket.status = "closed";
    ticket.closedAt = new Date();

    await ticket.save({ session });

    await createLedgerEntry({
      ticketId: ticket._id,
      actorId,
      action: "closed",
      field: "status",
      oldValue: previousStatus,
      newValue: "closed",
      description: `${(await User.findById(actorId).session(session).select("fullname")).fullname} closed this ticket.`,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return ticket;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const editTicket = async (ticketId, actorId, updates) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    const allowedFields = ["title", "description", "category", "priority", "status", "resolution"];
    const editableFields = Object.keys(updates).filter((key) => allowedFields.includes(key));

    for (const field of editableFields) {
      const oldValue = ticket[field];
      const newValue = updates[field];

      if (oldValue === newValue) continue;

      if (field === "status") {
        const allowedTransitions = {
          open: ["in_progress", "pending", "closed"],
          in_progress: ["pending", "resolved", "closed", "reopened"],
          pending: ["in_progress", "resolved", "closed"],
          reopened: ["in_progress", "pending", "resolved", "closed"],
          resolved: ["closed", "reopened"],
          closed: ["reopened"],
        };

        const allowed = allowedTransitions[oldValue] || [];
        if (!allowed.includes(newValue)) {
          const err = new Error(`Invalid status transition from ${oldValue} to ${newValue}`);
          err.status = 400;
          throw err;
        }

        ticket.status = newValue;

        if (newValue === "resolved") {
          ticket.resolvedAt = new Date();
        }
        if (newValue === "closed") {
          ticket.closedAt = new Date();
        }
        if (newValue === "reopened") {
          ticket.resolvedAt = undefined;
          ticket.closedAt = undefined;
        }

        await createLedgerEntry({
          ticketId: ticket._id,
          actorId,
          action: "status_changed",
          field,
          oldValue,
          newValue,
          description: `Status changed ${oldValue} → ${newValue}`,
          session,
        });
      } else if (field === "priority") {
        ticket.priority = newValue;
        await createLedgerEntry({
          ticketId: ticket._id,
          actorId,
          action: "priority_changed",
          field,
          oldValue,
          newValue,
          description: `Priority changed ${oldValue} → ${newValue}`,
          session,
        });
      } else {
        ticket[field] = newValue;
        await createLedgerEntry({
          ticketId: ticket._id,
          actorId,
          action: "edited",
          field,
          oldValue: String(oldValue ?? ""),
          newValue: String(newValue ?? ""),
          description: `Edited ${field}`,
          session,
        });
      }
    }

    await ticket.save({ session });
    await session.commitTransaction();
    session.endSession();

    return ticket;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const getTicketLedger = async (ticketId, user) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (user.role === "admin") {
    return TicketLedger.find({ ticketId }).sort({ createdAt: -1 }).populate("actorId", "fullname email role");
  }

  if (ticket.createdBy.toString() === user._id.toString()) {
    return TicketLedger.find({ ticketId }).sort({ createdAt: -1 }).populate("actorId", "fullname email role");
  }

  if (user.role === "support") {
    return TicketLedger.find({ ticketId }).sort({ createdAt: -1 }).populate("actorId", "fullname email role");
  }

  const err = new Error("Forbidden: insufficient rights");
  err.status = 403;
  throw err;
};

const createTicket = async (ticketData, userId) => {
  const ticketNumber = await generateTicketNumber();

  const ticket = await Ticket.create({
    ...ticketData,
    ticketNumber,
    createdBy: userId,
  });

  await createLedgerEntry({
    ticketId: ticket._id,
    actorId: userId,
    action: "created",
    description: "Ticket created.",
  });

  return ticket;
};

module.exports = {
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
};
