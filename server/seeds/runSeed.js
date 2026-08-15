require("dotenv").config();
const { seedAll } = require("./seedData");
const connectDB = require("../config/db");

const run = async () => {
  await connectDB();
  await seedAll();
  console.log("Seed completed successfully");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
