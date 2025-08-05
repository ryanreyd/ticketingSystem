const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/tickets', require('./routes/ticketRoutes'));

module.exports = app;
