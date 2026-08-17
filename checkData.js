require("dotenv").config({ path: "./server/.env" });
const mongoose = require("mongoose");
const Ticket = require("./server/models/ticketModel");

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log("Connected to DB");

    const withSpace = await Ticket.countDocuments({ status: "in progress" });
    console.log(`Tickets with status "in progress" (space): ${withSpace}`);

    const validStatuses = ["open", "in progress", "resolved", "closed"];
    const invalidStatus = await Ticket.countDocuments({
      status: { $nin: validStatuses, $exists: true },
    });
    console.log(`Tickets with invalid status values: ${invalidStatus}`);

    const validPriorities = ["low", "medium", "high"];
    const invalidPriority = await Ticket.countDocuments({
      priority: { $nin: validPriorities, $exists: true },
    });
    console.log(`Tickets with invalid priority values: ${invalidPriority}`);

    if (invalidPriority > 0) {
      const badPriorityTickets = await Ticket.find({
        priority: { $nin: validPriorities, $exists: true },
      }).select("_id title priority");
      console.log("Bad priority tickets:");
      badPriorityTickets.forEach((t) => console.log(`  ${t._id}: "${t.priority}" - ${t.title}`));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

checkData();
