const Department = require("../models/Department");
const Branch = require("../models/Branch");

const departments = [
  { name: "Admin", code: "ADMIN" },
  { name: "Encoder", code: "ENCODER" },
  { name: "Inventory", code: "INVENTORY" },
  { name: "Accounting", code: "ACCOUNTING" },
  { name: "Finance", code: "FINANCE" },
  { name: "OM", code: "OM" },
  { name: "Supervisor", code: "SUPERVISOR" },
  { name: "Logistic", code: "LOGISTIC" },
  { name: "HR", code: "HR" },
  { name: "Sales", code: "SALES" },
  { name: "Warehouse In-Charge", code: "WAREHOUSE" },
];

const branches = [
  { name: "Northmin-CDO", code: "NCDO" },
  { name: "Northmin-Bukidnon", code: "NBUK" },
  { name: "Caraga-Butuan", code: "CBTN" },
  { name: "PODI", code: "PODI" },
];

const seedDepartments = async () => {
  for (const dept of departments) {
    await Department.updateOne(
      { code: dept.code },
      { $setOnInsert: dept },
      { upsert: true }
    );
  }
  console.log(`Seeded ${departments.length} departments`);
};

const seedBranches = async () => {
  for (const branch of branches) {
    await Branch.updateOne(
      { code: branch.code },
      { $setOnInsert: branch },
      { upsert: true }
    );
  }
  console.log(`Seeded ${branches.length} branches`);
};

const seedAll = async () => {
  await seedDepartments();
  await seedBranches();
};

module.exports = { seedAll, seedDepartments, seedBranches, departments, branches };
