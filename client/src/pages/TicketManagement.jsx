import { useEffect, useState, useContext } from "react";
import { useTickets } from "../hooks/useTickets";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import TicketCard from "../components/TicketManagement/TicketCard";
import TicketDetail from "../components/TicketManagement/TicketDetail";

const TicketManagement = () => {
  const { getTickets } = useTickets();
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
        const data = await getTickets(params);
        const list = Array.isArray(data) ? data : Array.isArray(data?.tickets) ? data.tickets : [];
        setTickets(list);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [getTickets, statusFilter, priorityFilter]);

  const canCreate = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPPORT;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Ticket Management</h1>
            <p className="text-sm text-gray-500 mt-1">View, manage, and track support tickets.</p>
          </div>
          {canCreate && (
            <button
              onClick={() => alert("Create Ticket modal would open here.")}
              className="bg-blue-600 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              New Ticket
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No tickets found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onClick={setSelectedTicket}
                isSelected={selectedTicket?._id === ticket._id}
              />
            ))}
          </div>
        )}

        {selectedTicket && (
          <div className="fixed inset-0 z-40 bg-black/30 p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto my-8">
              <TicketDetail
                ticket={selectedTicket}
                user={user}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Close detail view
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketManagement;
