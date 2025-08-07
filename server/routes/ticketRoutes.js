const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');

router.use(auth);

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

module.exports = router;
