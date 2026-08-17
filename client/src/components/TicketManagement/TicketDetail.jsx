import React, { useState, useEffect, useCallback } from "react";
import ActionMenu from "./ActionMenu";
import Badge from "./Badge";
import TicketLedger from "./TicketLedger";
import CommentSection from "./CommentSection";
import { useTickets } from "../../hooks/useTickets";
import { useUsers } from "../../hooks/useUsers";
import { formatStatus, formatPriority, statusColor, priorityColor } from "./TicketCard";

const Modal = ({ open, onClose, title, children, width = "max-w-md" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${width} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const TicketDetail = ({ ticket, user }) => {
  const { claimTicket, assignTicket, changeTicketStatus, changeTicketPriority, resolveTicket, reopenTicket, closeTicket, getTicketById, getTicketLedger, updateTicket } = useTickets();
  const { getUsers } = useUsers();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTicket, setActiveTicket] = useState(ticket);
  const [ledger, setLedger] = useState([]);
  const [showLedger, setShowLedger] = useState(false);
  const [supportStaff, setSupportStaff] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  const [editForm, setEditForm] = useState({ title: "", description: "", category: "", resolution: "" });
  const [assignTo, setAssignTo] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [resolution, setResolution] = useState("");

  const refresh = useCallback(async () => {
    try {
      const updated = await getTicketById(ticket._id);
      setActiveTicket(updated);
    } catch {
      // ignore
    }
  }, [ticket._id, getTicketById]);

  useEffect(() => {
    setActiveTicket(ticket);
    setEditForm({
      title: ticket.title || "",
      description: ticket.description || "",
      category: ticket.category || "general",
      resolution: ticket.resolution || "",
    });
    setAssignTo(ticket.assignedTo?._id || "");
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
    setResolution(ticket.resolution || "");
  }, [ticket]);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const data = await getTicketLedger(ticket._id);
        setLedger(data);
      } catch {
        // ignore
      }
    };
    fetchLedger();
  }, [ticket._id, getTicketLedger]);

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const data = await getUsers({ limit: 100 });
        const users = data.users || data;
        setSupportStaff(users.filter((u) => u.role === "support" || u.role === "admin"));
      } catch {
        // ignore
      }
    };
    fetchSupport();
  }, [getUsers]);

  const handleClaim = async () => {
    setLoading(true);
    setMessage("");
    try {
      await claimTicket(ticket._id);
      setMessage("Ticket claimed successfully.");
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to claim ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTo) return;
    setLoading(true);
    setMessage("");
    try {
      await assignTicket(ticket._id, assignTo);
      setMessage("Ticket assigned successfully.");
      setAssignOpen(false);
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to assign ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (newStatus === ticket.status) {
      setStatusOpen(false);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await changeTicketStatus(ticket._id, newStatus);
      setMessage("Status updated.");
      setStatusOpen(false);
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async () => {
    if (newPriority === ticket.priority) {
      setPriorityOpen(false);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await changeTicketPriority(ticket._id, newPriority);
      setMessage("Priority updated.");
      setPriorityOpen(false);
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to update priority.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setLoading(true);
    setMessage("");
    try {
      await resolveTicket(ticket._id, resolution);
      setMessage("Ticket resolved.");
      setResolveOpen(false);
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to resolve ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async () => {
    setLoading(true);
    setMessage("");
    try {
      await reopenTicket(ticket._id);
      setMessage("Ticket reopened.");
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to reopen ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setLoading(true);
    setMessage("");
    try {
      await closeTicket(ticket._id);
      setMessage("Ticket closed.");
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to close ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const updates = {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        resolution: editForm.resolution,
      };
      await updateTicket(ticket._id, updates);
      setMessage("Ticket updated.");
      setEditOpen(false);
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to update ticket.");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && activeTicket.assignedTo && activeTicket.assignedTo._id === user._id;
  const isCreator = user && activeTicket.createdBy && activeTicket.createdBy._id === user._id;
  const isAdmin = user?.role === "admin";
  const isSupport = user?.role === "support";

  const canClaim = isSupport && !activeTicket.assignedTo && ["open", "in_progress", "pending"].includes(activeTicket.status);
  const canEdit = isAdmin || isOwner || isCreator;
  const canAssign = isAdmin;
  const canChangeStatus = isAdmin || isOwner;
  const canChangePriority = isAdmin || isOwner;
  const canResolve = isAdmin || (isOwner && activeTicket.status !== "closed");
  const canReopen = isAdmin || (isOwner && ["resolved", "closed"].includes(activeTicket.status));
  const canClose = isAdmin;

  const actions = [
    { label: "View Ledger", onClick: () => setShowLedger(true), disabled: false },
    ...(canEdit ? [{ label: "Edit Ticket", onClick: () => setEditOpen(true), disabled: loading }] : []),
    ...(canAssign ? [{ label: "Assign Ticket", onClick: () => setAssignOpen(true), disabled: loading }] : []),
    ...(canChangeStatus ? [{ label: "Change Status", onClick: () => setStatusOpen(true), disabled: loading }] : []),
    ...(canChangePriority ? [{ label: "Change Priority", onClick: () => setPriorityOpen(true), disabled: loading }] : []),
    ...(canClaim ? [{ label: "Claim Ticket", onClick: handleClaim, disabled: loading }] : []),
    ...(canReopen ? [{ label: "Reopen Ticket", onClick: handleReopen, disabled: loading }] : []),
    ...(canResolve ? [{ label: "Resolve Ticket", onClick: () => setResolveOpen(true), disabled: loading }] : []),
    ...(canClose ? [{ label: "Close Ticket", onClick: handleClose, disabled: loading }] : []),
  ];

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "pending", label: "Pending" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
    { value: "reopened", label: "Reopened" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start justify-between p-5 border-b border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono text-gray-500">{activeTicket.ticketNumber || activeTicket._id}</span>
            <Badge color={statusColor[activeTicket.status] || "gray"}>{formatStatus(activeTicket.status)}</Badge>
            <Badge color={priorityColor[activeTicket.priority] || "gray"}>{formatPriority(activeTicket.priority)}</Badge>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{activeTicket.title}</h2>
          {activeTicket.assignedTo && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{activeTicket.assignedTo.fullname}</span> is currently working on this ticket.
            </p>
          )}
        </div>
        <ActionMenu actions={actions} />
      </div>

      {message && (
        <div className="mx-5 mt-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-md">
          {message}
        </div>
      )}

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ticket Information</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Requester</span>
              <span className="text-gray-800 font-medium">{activeTicket.createdBy?.fullname || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-800 font-medium capitalize">{activeTicket.category || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Priority</span>
              <span className="text-gray-800 font-medium">{formatPriority(activeTicket.priority)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="text-gray-800 font-medium">{formatStatus(activeTicket.status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Assigned To</span>
              <span className="text-gray-800 font-medium">{activeTicket.assignedTo?.fullname || "Unassigned"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-800 font-medium">{new Date(activeTicket.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            {activeTicket.resolvedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Resolved</span>
                <span className="text-gray-800 font-medium">{new Date(activeTicket.resolvedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </div>
            )}
            {activeTicket.closedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Closed</span>
                <span className="text-gray-800 font-medium">{new Date(activeTicket.closedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{activeTicket.description || "No description provided."}</p>
        </div>
      </div>

      <div className="p-5 border-t border-gray-100">
        <CommentSection ticketId={activeTicket._id} user={user} />
      </div>

      <Modal open={showLedger} onClose={() => setShowLedger(false)} title="Ticket Ledger" width="max-w-lg">
        <TicketLedger entries={ledger} />
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Ticket">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
            <textarea
              value={editForm.resolution}
              onChange={(e) => setEditForm({ ...editForm, resolution: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Resolution summary..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleEdit} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Ticket">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select staff member</option>
              {supportStaff.map((u) => (
                <option key={u._id} value={u._id}>{u.fullname} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setAssignOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleAssign} disabled={loading || !assignTo} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">{loading ? "Assigning..." : "Assign"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Change Status">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setStatusOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleStatusChange} disabled={loading || newStatus === ticket.status} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">{loading ? "Updating..." : "Update"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={priorityOpen} onClose={() => setPriorityOpen(false)} title="Change Priority">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setPriorityOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handlePriorityChange} disabled={loading || newPriority === ticket.priority} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">{loading ? "Updating..." : "Update"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={resolveOpen} onClose={() => setResolveOpen(false)} title="Resolve Ticket">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Summary</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe how this ticket was resolved..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setResolveOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleResolve} disabled={loading} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition disabled:opacity-50">{loading ? "Resolving..." : "Resolve"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TicketDetail;
