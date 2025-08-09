const express = require("express");
const app = express();
const cors = require("cors");

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // or whatever your frontend URL is
    credentials: true, // optional: only if you're using cookies
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes")); // public
app.use("/api/tickets", require("./routes/ticketRoutes")); // protected
app.use("/api/users", require("./routes/userRoutes")); // protected

module.exports = app;
