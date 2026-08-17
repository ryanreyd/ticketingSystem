import React, { useEffect, useState, useContext } from "react";
import { useTickets } from "../hooks/useTickets";
import { useComments } from "../hooks/useComments";
import { AuthContext } from "../context/AuthContext";
import TicketRow from "../components/shared/TicketRow";
import StatusBadge from "../components/shared/StatusBadge";
import Avatar from "../components/shared/Avatar";
import { FiLoader, FiPlus } from "react-icons/fi";
import Button from "../components/Buttons";
import { ROLES } from "../constants/roles";

const SupportDashboard = () => {
  const { user } = useContext(AuthContext);
  const { getTickets, changeTicketStatus, changeTicketPriority, assignTicket } = useTickets();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const { createComment } = useComments();

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
        const data = await getTickets(params);
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load tickets");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, [getTickets, statusFilter, priorityFilter]);

  const handleStatusChange = async (ticketId, status) => {
    try {
      await changeTicketStatus(ticketId, status);
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status } : t))
      );
      setSelectedTicket((prev) => (prev && prev._id === ticketId ? { ...prev, status } : prev));
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const handlePriorityChange = async (ticketId, priority) => {
    try {
      await changeTicketPriority(ticketId, priority);
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, priority } : t))
      );
      setSelectedTicket((prev) => (prev && prev._id === ticketId ? { ...prev, priority } : prev));
    } catch (err) {
      console.error("Priority update failed", err);
    }
  };

  const handleAssign = async (ticketId) => {
    if (!user?._id) return;
    try {
      await assignTicket(ticketId, user._id);
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, assignedTo: user } : t))
      );
      setSelectedTicket((prev) =>
        prev && prev._id === ticketId ? { ...prev, assignedTo: user } : prev
      );
    } catch (err) {
      console.error("Assign failed", err);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !commentText.trim()) return;
    try {
      setSubmittingComment(true);
      await createComment(selectedTicket._id, commentText.trim(), true);
      setCommentText("");
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-3xl text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 p-4">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Support Dashboard</h2>
          <p className="text-sm text-gray-500">Manage and respond to submitted tickets.</p>
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {tickets.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No tickets found.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <TicketRow
                    key={ticket._id}
                    ticket={ticket}
                    density="dense"
                    showAssignDropdown
                    onView={setSelectedTicket}
                    onStatus={handleStatusChange}
                    onPriority={handlePriorityChange}
                    onAssign={handleAssign}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedTicket && (
        <div
          className="fixed inset-0 z-40 bg-black/40 p-4 overflow-y-auto"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="max-w-3xl mx-auto my-8 bg-white rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedTicket.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedTicket.ticketNumber || selectedTicket._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>

            <div className="px-4 py-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedTicket.status} />
                <span className="text-xs font-medium text-gray-600 capitalize">
                  Priority: {selectedTicket.priority}
                </span>
              </div>

              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {selectedTicket.description}
              </p>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                <p>
                  Assigned to:{" "}
                  {selectedTicket.assignedTo?.fullname || "Unassigned"}
                </p>
                <p>
                  Created by:{" "}
                  {selectedTicket.createdBy?.fullname || "Unknown"}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Internal Note
                </h4>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Add an internal note..."
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                    className="text-sm"
                  >
                    {submittingComment ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;
