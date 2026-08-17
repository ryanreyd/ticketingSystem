const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { ticketAuthz } = require("../middleware/ticketAuthz");
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  claimTicket,
  assignTicket,
  changeTicketStatus,
  changeTicketPriority,
  resolveTicket,
  reopenTicket,
  closeTicket,
  getTicketLedger,
} = require("../controllers/ticketController");

router.use(auth);

router.route("/")
  .get(getTickets)
  .post(createTicket);

router.route("/:id")
  .get(getTicketById)
  .put(ticketAuthz("edit"), updateTicket)
  .delete(role("admin"), deleteTicket);

router.post("/:id/claim", ticketAuthz("claim"), claimTicket);
router.post("/:id/assign", role(["admin"]), assignTicket);
router.post("/:id/status", ticketAuthz("change_status"), changeTicketStatus);
router.post("/:id/priority", ticketAuthz("change_priority"), changeTicketPriority);
router.post("/:id/resolve", ticketAuthz("resolve"), resolveTicket);
router.post("/:id/reopen", ticketAuthz("reopen"), reopenTicket);
router.post("/:id/close", ticketAuthz("close"), closeTicket);
router.get("/:id/ledger", getTicketLedger);

module.exports = router;
