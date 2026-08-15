const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");

router.use(auth);

router.route("/")
  .get(getTickets)
  .post(createTicket);

router.route("/:id")
  .get(getTicketById)
  .put(updateTicket)
  .delete(role("admin"), deleteTicket);

module.exports = router;
