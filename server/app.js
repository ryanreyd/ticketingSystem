const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));     // public
app.use('/api/tickets', require('./routes/ticketRoutes')); // protected

module.exports = app;
