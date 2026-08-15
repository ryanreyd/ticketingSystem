const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, please try again later" },
});

app.use(generalLimiter);
app.use("/api/auth", authLimiter);

// Body parsing with size limit
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/tickets/:ticketId/comments", require("./routes/commentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/branches", require("./routes/branchRoutes"));

// Global error handler
app.use(errorHandler);

module.exports = app;
