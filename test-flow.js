const dotenv = require("dotenv");
dotenv.config({ path: "./server/.env" });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const axios = require("axios");

const API_BASE = "http://localhost:8000/api";
const MONGO_URI = "mongodb://127.0.0.1:27018/ticketingSystem?replicaSet=rs0";

const User = require("./server/models/User");
const Ticket = require("./server/models/ticketModel");
const TicketLedger = require("./server/models/ticketLedgerModel");

let passCount = 0;
let failCount = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    passCount++;
  } else {
    console.log(`  [FAIL] ${msg}`);
    failCount++;
  }
}

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data.token;
}

async function run() {
  console.log("=== Setting up test users (direct DB insert) ===");

  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected\n");

  const now = Date.now();
  const hashedPassword = await bcrypt.hash("Test1234", 12);

  const submitterUser = await User.findOneAndUpdate(
    { email: `submitter_${now}@test.com` },
    {
      fullname: "Test Submitter",
      email: `submitter_${now}@test.com`,
      password: hashedPassword,
      role: "user",
      isActive: true,
      profileCompleted: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const supportUser = await User.findOneAndUpdate(
    { email: `support_${now}@test.com` },
    {
      fullname: "Test Support",
      email: `support_${now}@test.com`,
      password: hashedPassword,
      role: "support",
      isActive: true,
      profileCompleted: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const adminUser = await User.findOneAndUpdate(
    { email: `admin_${now}@test.com` },
    {
      fullname: "Test Admin",
      email: `admin_${now}@test.com`,
      password: hashedPassword,
      role: "admin",
      isActive: true,
      profileCompleted: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Created test users:`);
  console.log(`  Submitter: ${submitterUser.email} (role: ${submitterUser.role}, _id: ${submitterUser._id})`);
  console.log(`  Support:   ${supportUser.email} (role: ${supportUser.role}, _id: ${supportUser._id})`);
  console.log(`  Admin:     ${adminUser.email} (role: ${adminUser.role}, _id: ${adminUser._id})\n`);

  console.log("=== TEST 1: Submitter logs in and creates a ticket ===");
  const submitterToken = await login(`submitter_${now}@test.com`, "Test1234");
  assert(!!submitterToken, "Submitter can login and receive token");

  const createRes = await axios.post(
    `${API_BASE}/tickets`,
    {
      title: "Test Ticket for Flow",
      description: "This is a test ticket created via API",
      priority: "high",
      category: "technical",
    },
    { headers: { Authorization: `Bearer ${submitterToken}` } }
  );

  const createdTicket = createRes.data;
  assert(createdTicket.title === "Test Ticket for Flow", "Created ticket has correct title");
  assert(createdTicket.createdBy._id === String(submitterUser._id), "Created ticket's createdBy matches submitter");
  assert(!createdTicket.assignedTo, "Created ticket is initially unassigned");
  assert(createdTicket.status === "open", "Created ticket has 'open' status by default");
  assert(createdTicket.priority === "high", "Created ticket has 'high' priority");
  assert(createdTicket.category === "technical", "Created ticket has 'technical' category");
  console.log(`  Ticket created: _id=${createdTicket._id}, ticketNumber=${createdTicket.ticketNumber}\n`);

  console.log("=== TEST 2: Support sees the ticket as unassigned ===");
  const supportToken = await login(`support_${now}@test.com`, "Test1234");
  assert(!!supportToken, "Support can login and receive token");

  const supportTicketsRes = await axios.get(`${API_BASE}/tickets`, {
    headers: { Authorization: `Bearer ${supportToken}` },
  });
  const supportTickets = supportTicketsRes.data.tickets || supportTicketsRes.data;
  const foundTicket = supportTickets.find((t) => t._id === String(createdTicket._id));
  assert(!!foundTicket, "Support can see the newly created ticket in their list");
  assert(!foundTicket.assignedTo, "Support sees the ticket as unassigned");
  assert(foundTicket.status === "open", "Support sees ticket with 'open' status");
  console.log(`  Support sees ${supportTickets.length} ticket(s)\n`);

  console.log("=== TEST 3: Support claims the ticket ===");
  const claimRes = await axios.post(
    `${API_BASE}/tickets/${createdTicket._id}/claim`,
    {},
    { headers: { Authorization: `Bearer ${supportToken}` } }
  );
  const claimedTicket = claimRes.data;
  assert(claimedTicket.assignedTo.toString() === String(supportUser._id), "Ticket is now assigned to support after claim");
  assert(claimedTicket.status === "in_progress", "Ticket status changed to 'in_progress' after claim");
  console.log(`  Ticket claimed. assignedTo=${claimedTicket.assignedTo}, status=${claimedTicket.status}\n`);

  console.log("=== TEST 4: DB verification after claim ===");
  const dbTicketAfterClaim = await Ticket.findById(createdTicket._id).populate("assignedTo", "fullname email role");
  assert(dbTicketAfterClaim.assignedTo._id.toString() === String(supportUser._id), "DB ticket has support as assignedTo");
  assert(dbTicketAfterClaim.status === "in_progress", "DB ticket status is 'in_progress'");
  const ledgerAfterClaim = await TicketLedger.find({ ticketId: createdTicket._id }).populate("actorId", "fullname role");
  const claimEntry = ledgerAfterClaim.find((l) => l.action === "claimed");
  assert(!!claimEntry, "Ledger entry exists for claim action");
  assert(claimEntry.actorId._id.toString() === String(supportUser._id), "Ledger claim entry has correct actor (support)");
  console.log(`  DB verification: ${ledgerAfterClaim.length} ledger entries found\n`);

  console.log("=== TEST 5: Admin assigns ticket to support (re-assign) ===");
  const adminToken = await login(`admin_${now}@test.com`, "Test1234");
  assert(!!adminToken, "Admin can login and receive token");

  const assignRes = await axios.post(
    `${API_BASE}/tickets/${createdTicket._id}/assign`,
    { assignedTo: String(supportUser._id) },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const assignedTicket = assignRes.data;
  assert(assignedTicket.assignedTo.toString() === String(supportUser._id), "Admin can assign ticket to support");
  console.log(`  Ticket re-assigned by admin to support\n`);

  console.log("=== TEST 6: Admin can view all tickets (unfiltered) ===");
  const adminTicketsRes = await axios.get(`${API_BASE}/tickets`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminTickets = adminTicketsRes.data.tickets || adminTicketsRes.data;
  assert(adminTickets.length >= 1, "Admin sees at least 1 ticket (all tickets)");
  const adminFound = adminTickets.find((t) => t._id === String(createdTicket._id));
  assert(!!adminFound, "Admin can find the test ticket in their list");
  console.log(`  Admin sees ${adminTickets.length} ticket(s)\n`);

  console.log("=== TEST 7: Submitter sees only their own tickets ===");
  const submitterTicketsRes = await axios.get(`${API_BASE}/tickets`, {
    headers: { Authorization: `Bearer ${submitterToken}` },
  });
  const submitterTickets = submitterTicketsRes.data.tickets || submitterTicketsRes.data;
  const submitterFound = submitterTickets.find((t) => t._id === String(createdTicket._id));
  assert(!!submitterFound, "Submitter can see their own ticket in their list");
  console.log(`  Submitter sees ${submitterTickets.length} ticket(s) (only their own)\n`);

  console.log("=== TEST 8: Support can NOT claim an already-claimed ticket ===");
  try {
    await axios.post(
      `${API_BASE}/tickets/${createdTicket._id}/claim`,
      {},
      { headers: { Authorization: `Bearer ${supportToken}` } }
    );
    assert(false, "Support should NOT be able to claim an already-claimed ticket");
  } catch (err) {
    assert(err.response?.status === 409, "Support gets 409 Conflict when claiming already-claimed ticket");
    assert(err.response?.data?.message === "This ticket has already been claimed", "Error message is correct");
  }
  console.log("");

  console.log("=== TEST 9: Submitter CANNOT claim tickets (authz) ===");
  try {
    await axios.post(
      `${API_BASE}/tickets/${createdTicket._id}/claim`,
      {},
      { headers: { Authorization: `Bearer ${submitterToken}` } }
    );
    assert(false, "Submitter should NOT be able to claim a ticket");
  } catch (err) {
    assert(err.response?.status === 403, "Submitter gets 403 Forbidden when trying to claim");
  }
  console.log("");

  console.log("=== TEST 10: Submitter CAN add comments to their own ticket ===");
  const commentRes = await axios.post(
    `${API_BASE}/tickets/${createdTicket._id}/comments`,
    { content: "This is a test comment from submitter", isInternal: false },
    { headers: { Authorization: `Bearer ${submitterToken}` } }
  );
  assert(!!commentRes.data, "Submitter can post a comment on their ticket");
  console.log(`  Comment posted: _id=${commentRes.data._id}\n`);

  console.log("=== TEST 11: DB verification of final ticket state ===");
  const finalTicket = await Ticket.findById(createdTicket._id)
    .populate("createdBy", "fullname email role")
    .populate("assignedTo", "fullname email role");
  assert(finalTicket.assignedTo._id.toString() === String(supportUser._id), "DB: ticket assigned to support");
  assert(finalTicket.status === "in_progress", "DB: ticket status is 'in_progress'");
  assert(finalTicket.createdBy._id.toString() === String(submitterUser._id), "DB: createdBy is submitter");
  assert(finalTicket.claimedAt !== undefined, "DB: claimedAt is set");

  const allComments = await mongoose.connection.db.collection("comments").find({ ticketId: createdTicket._id }).toArray();
  assert(allComments.length >= 1, "DB: at least 1 comment exists");
  console.log(`  DB: ticket has ${allComments.length} comment(s)\n`);

  console.log("=== TEST 12: Support can view ticket detail via getTicketById ===");
  const detailRes = await axios.get(`${API_BASE}/tickets/${createdTicket._id}`, {
    headers: { Authorization: `Bearer ${supportToken}` },
  });
  const ticketDetail = detailRes.data;
  assert(ticketDetail.assignedTo._id.toString() === String(supportUser._id), "Support can view ticket detail (assigned)");
  console.log(`  Support views detail: title=${ticketDetail.title}\n`);

  console.log("=== TEST 13: Support can list all users ===");
  const supportUsersRes = await axios.get(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${supportToken}` },
  });
  const supportUsers = supportUsersRes.data.users || supportUsersRes.data;
  assert(supportUsersRes.status === 200, "Support gets 200 when listing users");
  assert(Array.isArray(supportUsers) && supportUsers.length >= 1, "Support receives a non-empty users list");
  const adminInList = supportUsers.find((u) => u._id === String(adminUser._id));
  assert(!!adminInList, "Support can see other users (incl. admin) in the list");
  console.log(`  Support manages ${supportUsers.length} user(s)\n`);

  console.log("=== TEST 14: Regular user CANNOT list users ===");
  try {
    await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${submitterToken}` },
    });
    assert(false, "Regular user should NOT be able to list users");
  } catch (err) {
    assert(err.response?.status === 403, "Regular user gets 403 when listing users");
  }
  console.log("");

  console.log("=== TEST 15: Support CANNOT create users ===");
  try {
    await axios.post(
      `${API_BASE}/users`,
      { fullname: "Blocked", email: `blocked_${now}@test.com`, password: "Test1234", role: "user" },
      { headers: { Authorization: `Bearer ${supportToken}` } }
    );
    assert(false, "Support should NOT be able to create users");
  } catch (err) {
    assert(err.response?.status === 403, "Support gets 403 when creating users");
  }
  console.log("");

  console.log("=== TEST 16: Support CANNOT delete users ===");
  try {
    await axios.delete(`${API_BASE}/users/${submitterUser._id}`, {
      headers: { Authorization: `Bearer ${supportToken}` },
    });
    assert(false, "Support should NOT be able to delete users");
  } catch (err) {
    assert(err.response?.status === 403, "Support gets 403 when deleting users");
  }
  console.log("");

  console.log("=== TEST 17: Support CAN edit a non-admin user ===");
  try {
    const editRes = await axios.put(
      `${API_BASE}/users/${submitterUser._id}`,
      { viberPhone: "09171234567" },
      { headers: { Authorization: `Bearer ${supportToken}` } }
    );
    assert(editRes.status === 200, "Support can edit a non-admin user (PUT returns 200)");
    assert(typeof editRes.data.viberPhone === "string" && editRes.data.viberPhone.includes("9171234567"), "Support's edit (viberPhone) is applied (normalized)");
  } catch (err) {
    assert(false, "Support should be able to edit a non-admin user");
  }
  console.log("");

  console.log("=== Summary ===");
  console.log(`  Passed: ${passCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total:  ${passCount + failCount}`);

  // Cleanup
  await Ticket.deleteOne({ _id: createdTicket._id });
  await TicketLedger.deleteMany({ ticketId: createdTicket._id });
  await User.deleteOne({ _id: submitterUser._id });
  await User.deleteOne({ _id: supportUser._id });
  await User.deleteOne({ _id: adminUser._id });
  console.log("\nTest data cleaned up.");

  await mongoose.disconnect();

  process.exit(failCount > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
