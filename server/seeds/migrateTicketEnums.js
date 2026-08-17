require("dotenv").config();
const mongoose = require("mongoose");
const Ticket = require("../models/ticketModel");

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log("Connected to DB");

    const statusResult = await Ticket.updateMany(
      { status: "in progress" },
      { $set: { status: "in_progress" } }
    );
    console.log(`Status migration: ${statusResult.modifiedCount} tickets updated from "in progress" to "in_progress"`);

    const priorityResult = await Ticket.updateMany(
      { priority: { $nin: ["low", "medium", "high", "urgent"] } },
      { $set: { priority: "medium" } }
    );
    console.log(`Priority migration: ${priorityResult.modifiedCount} tickets normalized to "medium"`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
};

migrate();
