require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("../config/db");
const Ticket = require("../models/ticketModel");
const User = require("../models/User");
const Department = require("../models/Department");
const Branch = require("../models/Branch");
const { seedAll } = require("./seedData");

const STATUSES = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const CATEGORIES = ["technical", "billing", "general"];
const REQUESTERS = ["Alice Johnson", "Bob Smith", "Carol Lee", "David Brown", "Eva Green"];

const TICKET_TITLES = [
  "Cannot login to the customer portal",
  "Invoice missing line items for order #1024",
  "Server 500 error when submitting the checkout form",
  "Request read-only access to the reporting dashboard",
  "Email notifications delayed by 15 minutes",
  "Mobile app crashes on the payments screen",
  "Reset multi-factor auth for user account",
  "Feature request: bulk export tickets to CSV",
  "SLA breach for ticket #3098 not escalated",
  "Update onboarding docs for new support hires",
  "Database connection timeout on the orders API",
  "Password reset link expires before email is received",
  "Incorrect tax calculation on EU invoices",
  "API rate limit too low for integration partner",
  "Assignee field blank on newly created tickets",
  "Unable to attach files larger than 5MB",
  "Search returns stale results after status change",
  "Reopened ticket loses original description",
  "Weekly digest emails contain duplicate entries",
  "Dark mode styles missing on the settings page",
];

const seedTickets = async () => {
  await connectDB();
  await seedAll();

  const department = (await Department.findOne()) || (await Department.create({ name: "Support", code: "SUPPORT" }));
  const branch = (await Branch.findOne()) || (await Branch.create({ name: "HQ", code: "HQ" }));

  let admin = await User.findOne({ email: "admin@test.local" });
  if (!admin) {
    admin = await User.create({
      fullname: "Admin User",
      email: "admin@test.local",
      password: await bcrypt.hash("Pass1234", 10),
      department: department._id,
      branch: branch._id,
      viberPhone: "+1234567890",
      role: "admin",
    });
  }

  let support = await User.findOne({ email: "support@test.local" });
  if (!support) {
    support = await User.create({
      fullname: "Support Agent",
      email: "support@test.local",
      password: await bcrypt.hash("Pass1234", 10),
      department: department._id,
      branch: branch._id,
      viberPhone: "+1234567891",
      role: "support",
    });
  }

  await Ticket.deleteMany({});

  const tickets = [];
  for (let i = 0; i < 20; i++) {
    tickets.push({
      title: TICKET_TITLES[i],
      description: `Reproducible steps and details for ticket ${i + 1}.`,
      status: STATUSES[i % STATUSES.length],
      priority: PRIORITIES[i % PRIORITIES.length],
      category: CATEGORIES[i % CATEGORIES.length],
      createdBy: i % 3 === 0 ? admin._id : support._id,
      assignedTo: i % 2 === 0 ? support._id : admin._id,
      createdAt: new Date(Date.now() - (20 - i) * 86400000),
      updatedAt: new Date(Date.now() - (20 - i) * 86400000),
    });
  }

  await Ticket.insertMany(tickets);

  const byStatus = await Ticket.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log(`Seeded ${tickets.length} tickets`);
  byStatus.forEach((s) => console.log(`  ${s._id}: ${s.count}`));

  process.exit(0);
};

seedTickets().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
