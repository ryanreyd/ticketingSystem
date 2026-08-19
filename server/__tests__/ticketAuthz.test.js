const mongoose = require("mongoose");
const { can } = require("../middleware/ticketAuthz");
const ROLES = require("../middleware/roleConstants");

const makeUser = (overrides = {}) => ({
  _id: "user_id",
  role: ROLES.USER,
  ...overrides,
});

const makeTicket = (overrides = {}) => ({
  _id: "ticket_id",
  createdBy: "user_id",
  assignedTo: null,
  ...overrides,
});

describe("can", () => {
  const admin = makeUser({ _id: "admin_id", role: ROLES.ADMIN });
  const support = makeUser({ _id: "support_id", role: ROLES.SUPPORT });
  const owner = makeUser({ _id: "owner_id", role: ROLES.USER });
  const otherUser = makeUser({ _id: "other_id", role: ROLES.USER });

  const unassignedTicket = makeTicket({ createdBy: "owner_id", assignedTo: null });
  const assignedToSupport = makeTicket({ createdBy: "owner_id", assignedTo: "support_id" });
  const assignedToOther = makeTicket({ createdBy: "owner_id", assignedTo: "other_id" });

  describe("edit", () => {
    test("admin can edit any ticket", () => {
      expect(can(admin, unassignedTicket, "edit")).toBe(true);
      expect(can(admin, assignedToSupport, "edit")).toBe(true);
    });

    test("support can edit only if assigned", () => {
      expect(can(support, unassignedTicket, "edit")).toBe(false);
      expect(can(support, assignedToSupport, "edit")).toBe(true);
      expect(can(support, assignedToOther, "edit")).toBe(false);
    });

    test("owner can edit their own ticket", () => {
      expect(can(owner, unassignedTicket, "edit")).toBe(true);
      expect(can(owner, assignedToSupport, "edit")).toBe(true);
    });

    test("non-owner user cannot edit someone else's ticket", () => {
      expect(can(otherUser, unassignedTicket, "edit")).toBe(false);
      expect(can(otherUser, assignedToSupport, "edit")).toBe(false);
    });
  });

  describe("change_status", () => {
    test("admin can change status on any ticket", () => {
      expect(can(admin, unassignedTicket, "change_status")).toBe(true);
    });

    test("support can change status only if assigned", () => {
      expect(can(support, unassignedTicket, "change_status")).toBe(false);
      expect(can(support, assignedToSupport, "change_status")).toBe(true);
    });

    test("owner cannot change status on their own ticket", () => {
      expect(can(owner, assignedToSupport, "change_status")).toBe(false);
    });

    test("non-owner user cannot change status", () => {
      expect(can(otherUser, unassignedTicket, "change_status")).toBe(false);
    });
  });

  describe("change_priority", () => {
    test("admin can change priority on any ticket", () => {
      expect(can(admin, unassignedTicket, "change_priority")).toBe(true);
    });

    test("support can change priority only if assigned", () => {
      expect(can(support, unassignedTicket, "change_priority")).toBe(false);
      expect(can(support, assignedToSupport, "change_priority")).toBe(true);
    });

    test("owner can change priority on their own ticket", () => {
      expect(can(owner, assignedToSupport, "change_priority")).toBe(true);
    });

    test("non-owner user cannot change priority", () => {
      expect(can(otherUser, unassignedTicket, "change_priority")).toBe(false);
    });
  });

  describe("claim", () => {
    test("admin can claim an unassigned ticket", () => {
      expect(can(admin, unassignedTicket, "claim")).toBe(true);
    });

    test("admin cannot claim an already assigned ticket", () => {
      expect(can(admin, assignedToSupport, "claim")).toBe(false);
    });

    test("support can claim an unassigned ticket", () => {
      expect(can(support, unassignedTicket, "claim")).toBe(true);
    });

    test("support cannot claim an already assigned ticket", () => {
      expect(can(support, assignedToSupport, "claim")).toBe(false);
    });

    test("owner cannot claim a ticket", () => {
      expect(can(owner, unassignedTicket, "claim")).toBe(false);
    });

    test("non-owner user cannot claim a ticket", () => {
      expect(can(otherUser, unassignedTicket, "claim")).toBe(false);
    });
  });

  describe("resolve", () => {
    test("admin can resolve any ticket", () => {
      expect(can(admin, unassignedTicket, "resolve")).toBe(true);
    });

    test("owner cannot resolve their own ticket", () => {
      expect(can(owner, unassignedTicket, "resolve")).toBe(false);
      expect(can(owner, assignedToSupport, "resolve")).toBe(false);
    });

    test("support can resolve if assigned", () => {
      expect(can(support, assignedToSupport, "resolve")).toBe(true);
      expect(can(support, unassignedTicket, "resolve")).toBe(false);
    });

    test("non-owner user cannot resolve", () => {
      expect(can(otherUser, unassignedTicket, "resolve")).toBe(false);
    });
  });

  describe("reopen", () => {
    test("admin can reopen any ticket", () => {
      expect(can(admin, unassignedTicket, "reopen")).toBe(true);
    });

    test("owner can reopen their own ticket", () => {
      expect(can(owner, unassignedTicket, "reopen")).toBe(true);
    });

    test("support can reopen if assigned", () => {
      expect(can(support, assignedToSupport, "reopen")).toBe(true);
      expect(can(support, unassignedTicket, "reopen")).toBe(false);
    });

    test("non-owner user cannot reopen", () => {
      expect(can(otherUser, unassignedTicket, "reopen")).toBe(false);
    });
  });

  describe("close", () => {
    test("admin can close any ticket", () => {
      expect(can(admin, unassignedTicket, "close")).toBe(true);
    });

    test("support cannot close any ticket", () => {
      expect(can(support, unassignedTicket, "close")).toBe(false);
      expect(can(support, assignedToSupport, "close")).toBe(false);
    });

    test("owner can close their own ticket", () => {
      expect(can(owner, unassignedTicket, "close")).toBe(true);
    });

    test("non-owner user cannot close", () => {
      expect(can(otherUser, unassignedTicket, "close")).toBe(false);
    });
  });

  describe("unknown action", () => {
    test("returns false for unknown action", () => {
      expect(can(admin, unassignedTicket, "unknown")).toBe(false);
    });
  });

  describe("missing arguments", () => {
    test("returns false if user is missing", () => {
      expect(can(null, unassignedTicket, "edit")).toBe(false);
    });

    test("returns false if ticket is missing", () => {
      expect(can(admin, null, "edit")).toBe(false);
    });

    test("returns false if action is missing", () => {
      expect(can(admin, unassignedTicket, null)).toBe(false);
    });
  });

  describe("with populated Mongoose documents", () => {
    const oid = () => new mongoose.Types.ObjectId();
    const supportId = oid();
    const ownerId = oid();
    const adminId = oid();

    const support = makeUser({ _id: supportId, role: ROLES.SUPPORT });
    const owner = makeUser({ _id: ownerId, role: ROLES.USER });
    const admin = makeUser({ _id: adminId, role: ROLES.ADMIN });
    const otherUser = makeUser({ _id: oid(), role: ROLES.USER });

    const populatedAssignedTicket = {
      _id: oid(),
      createdBy: { _id: ownerId, role: ROLES.USER, fullname: "Owner" },
      assignedTo: { _id: supportId, role: ROLES.SUPPORT, fullname: "Support" },
    };
    const populatedUnassignedTicket = {
      _id: oid(),
      createdBy: { _id: ownerId, role: ROLES.USER, fullname: "Owner" },
      assignedTo: null,
    };

    test("support can change status on ticket assigned to them (populated)", () => {
      expect(can(support, populatedAssignedTicket, "change_status")).toBe(true);
    });

    test("support cannot change status on unassigned ticket (populated)", () => {
      expect(can(support, populatedUnassignedTicket, "change_status")).toBe(false);
    });

    test("owner cannot change status on own ticket (populated)", () => {
      expect(can(owner, populatedAssignedTicket, "change_status")).toBe(false);
    });

    test("non-owner user cannot change status (populated)", () => {
      expect(can(otherUser, populatedAssignedTicket, "change_status")).toBe(false);
    });

    test("admin can change status on any ticket (populated)", () => {
      expect(can(admin, populatedAssignedTicket, "change_status")).toBe(true);
      expect(can(admin, populatedUnassignedTicket, "change_status")).toBe(true);
    });

    test("support can resolve ticket assigned to them (populated)", () => {
      expect(can(support, populatedAssignedTicket, "resolve")).toBe(true);
    });

    test("owner cannot resolve their own ticket (populated)", () => {
      expect(can(owner, populatedAssignedTicket, "resolve")).toBe(false);
    });

    test("non-owner user cannot resolve (populated)", () => {
      expect(can(otherUser, populatedAssignedTicket, "resolve")).toBe(false);
    });

    test("support can edit ticket assigned to them (populated)", () => {
      expect(can(support, populatedAssignedTicket, "edit")).toBe(true);
    });

    test("owner can edit their own ticket (populated)", () => {
      expect(can(owner, populatedAssignedTicket, "edit")).toBe(true);
    });
  });
});
