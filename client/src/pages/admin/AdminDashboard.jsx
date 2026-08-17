import React, { useContext, useEffect, useState } from "react";
import { useTickets } from "../../hooks/useTickets";
import TicketRow from "../../components/shared/TicketRow";
import StatusBadge from "../../components/shared/StatusBadge";
import Avatar from "../../components/shared/Avatar";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Buttons";
import { FiMenu, FiLogOut, FiUser, FiGrid } from "react-icons/fi";
import { ROLES } from "../../constants/roles";


const AdminDashboard = () => {
  const { user: _user } = useContext(AuthContext);
  const { getTickets, refresh: refetch } = useTickets();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, _setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("-1");

  const [assignModal, setAssignModal] = useState({ ticketId: null, open: false });
  const [assignForm, setAssignForm] = useState({ userId: "" });

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        const params = {
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        };
        const data = await getTickets(params);
        setTickets(
          Array.isArray(data) ? data : Array.isArray(data?.tickets) ? data.tickets : []
        );
      } catch (err) {
        setError("Failed to load tickets");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, [getTickets, statusFilter, priorityFilter]);

  const density = window.innerWidth < 768 ? "compact" : "dense";

  const handleAssign = async (ticketId) => {
    setAssignModal({ ticketId, open: true });
    setAssignForm({ userId: "" });
  };

  const handleAssignSubmit = async () => {
    if (!assignForm.userId) return;
    try {
      refetch();
      setAssignModal({ ...assignModal, open: false });
    } catch (e) {
      console.error("Assign failed", e);
    }
  };

  const handlePriority = async (ticketId, currentPriority) => {
    const newPriority = window.prompt(`Change priority from ${currentPriority}`, currentPriority);
    if (newPriority && ["low", "medium", "high", "urgent"].includes(newPriority)) {
      try {
        refetch();
      } catch (e) {
        console.error("Priority update failed", e);
      }
    }
  };

  const handleStatusToggle = async (ticketId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "in_progress" : "open";
    if (window.confirm(`Change status to ${newStatus}?`)) {
      try {
        refetch();
      } catch (e) {
        console.error("Status update failed", e);
      }
    }
  };

  const handleCloseReopen = async (ticketId, currentStatus) => {
    if (currentStatus === "closed") {
      if (window.confirm("Reopen this ticket?")) {
        try {
          refetch();
        } catch (e) {
          console.error("Reopen failed", e);
        }
      }
    } else {
      if (window.confirm("Close this ticket?")) {
        try {
          refetch();
        } catch (e) {
          console.error("Close failed", e);
        }
      }
    }
  };

  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  const sortedTickets = [...tickets].sort((a, b) => {
    const dir = sortDir === "1" ? 1 : -1;
    if (sortBy === "createdAt") {
      return dir * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return 0;
  });

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiGrid size={20} className="text-indigo-600" />
          <span className="text-lg font-semibold text-gray-900">Ticket Management</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sorted by {sortBy}</span>
          <button
            onClick={() => setSortDir((sortDir === "1" ? "-1" : "1"))}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition text-indigo-500 text-xs"
          >
            {sortDir === "1" ? "▲" : "▼"}
          </button>
          <span className="text-sm text-gray-500">·</span>
          <span className="text-sm text-gray-500">Status: {statusFilter || "All"}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-2 bg-gray-100 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <span className="text-sm text-gray-500">·</span>
          <span className="text-sm text-gray-500">Priority: {priorityFilter || "All"}</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="ml-2 bg-gray-100 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </nav>

      <main className="overflow-x-auto">
        <table className="w-full caption-separator">
          <caption className="text-sm text-gray-500 px-4 py-3 font-medium">
            All Tickets ({sortedTickets.length})
          </caption>
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-50 z-10">
                Ticket #
              </th>
              <th className="text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-50 z-10">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-50 z-10">
                Title
              </th>
              <th className="text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-50 z-10">
                Priority
              </th>
              <th className="text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-50 z-10">
                Assignee
              </th>
              <th className="text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-50 z-10">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-8">
                  No tickets found
                </td>
              </tr>
            ) : (
              sortedTickets.map((ticket) => (
                <TicketRow
                  key={ticket._id}
                  ticket={ticket}
                  density={density}
                  onView={() => alert(`View ticket ${ticket._id}`)}
                  onAssign={() => handleAssign(ticket._id)}
                  onPriority={() => handlePriority(ticket._id, ticket.priority)}
                  onStatus={() => handleStatusToggle(ticket._id, ticket.status)}
                  onCloseReopen={() => handleCloseReopen(ticket._id, ticket.status)}
                  showAssignDropdown
                />
              ))
            )}
          </tbody>
        </table>
      </main>

      {/* Assign Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Assign Ticket</h3>
            <select
              value={assignForm.userId}
              onChange={(e) => setAssignForm({ userId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select support agent</option>
              {"Support agents placeholder"}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setAssignModal({ ...assignModal, open: false })}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;