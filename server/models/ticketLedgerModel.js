const mongoose = require("mongoose");

const ticketLedgerSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "created",
        "edited",
        "assigned",
        "claimed",
        "priority_changed",
        "status_changed",
        "reopened",
        "resolved",
        "closed",
        "reassigned",
        "comment_added",
        "internal_note_added",
        "attachment_added",
      ],
    },
    field: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

ticketLedgerSchema.index({ ticketId: 1, createdAt: -1 });

module.exports = mongoose.model("TicketLedger", ticketLedgerSchema);
