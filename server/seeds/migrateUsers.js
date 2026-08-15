require("dotenv").config();
const User = require("../models/User");
const Department = require("../models/Department");
const Branch = require("../models/Branch");
const connectDB = require("../config/db");

const migrate = async () => {
  await connectDB();

  const users = await User.find({
    $or: [
      { department: { $type: "string" } },
      { branch: { $type: "string" } },
    ],
  });

  console.log(`Found ${users.length} users with string-based department/branch`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    let modified = false;

    if (typeof user.department === "string" && user.department.trim()) {
      const dept = await Department.findOne({
        name: { $regex: new RegExp(`^${user.department.trim()}$`, "i") },
      });
      if (dept) {
        user.department = dept._id;
        modified = true;
      } else {
        console.warn(`No department match for "${user.department}" (user: ${user.email})`);
        user.department = undefined;
        modified = true;
      }
    }

    if (typeof user.branch === "string" && user.branch.trim()) {
      const branch = await Branch.findOne({
        name: { $regex: new RegExp(`^${user.branch.trim()}$`, "i") },
      });
      if (branch) {
        user.branch = branch._id;
        modified = true;
      } else {
        console.warn(`No branch match for "${user.branch}" (user: ${user.email})`);
        user.branch = undefined;
        modified = true;
      }
    }

    if (modified) {
      user.profileCompleted = user._checkProfileComplete();
      await user.save();
      migrated++;
    } else {
      skipped++;
    }
  }

  const unsetResult = await User.updateMany(
    { jobPosition: { $exists: true } },
    { $unset: { jobPosition: 1 } }
  );

  console.log(`Migration complete: ${migrated} updated, ${skipped} skipped`);
  console.log(`Removed jobPosition from ${unsetResult.modifiedCount} users`);

  const remaining = await User.countDocuments({
    $or: [
      { department: { $type: "string" } },
      { branch: { $type: "string" } },
    ],
  });
  console.log(`Users still with string values: ${remaining}`);

  process.exit(0);
};

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
