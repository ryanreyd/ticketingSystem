import React, { useEffect, useState, useContext, useCallback } from "react";
import { useTickets } from "../hooks/useTickets";
import { AuthContext } from "../context/AuthContext";
import StatusBadge from "../components/shared/StatusBadge";
import Avatar from "../components/shared/Avatar";
import { FiLoader } from "react-icons/fi";
import Button from "../components/Buttons";
import { FiPlus } from "react-icons/fi";
import axiosClient from "../api/axiosClient";

const SubmitterDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const { getTickets } = useTickets();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTickets({ createdBy: user?._id });
      setTickets(
        Array.isArray(data) ? data : Array.isArray(data?.tickets) ? data.tickets : []
      );
    } catch (err) {
      setError("Failed to load tickets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getTickets, user?._id]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Track which ticket is open for detail view
  const [openTicket, setOpenTicket] = useState(null);

  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  // Mark resolved/closed tickets for reduced opacity
  const displayedTickets = tickets.map((ticket) => {
    const isResolvedClosed =
      ticket.status === "resolved" || ticket.status === "closed";
    const opacity = isResolvedClosed ? "0.5" : "1";
    return { ...ticket, opacity, isResolvedClosed };
  });

  const handleCreateTicket = async () => {
    const title = window.prompt("Ticket title:");
    if (!title) return;
    const description = window.prompt("Description:");
    const priority = window.prompt("Priority (low/medium/high/urgent):") || "medium";
    const category = window.prompt("Category (technical/billing/general):") || "general";

    try {
      const res = await axiosClient.post("/tickets", { title, description, priority, category }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the tickets list
      loadTickets();
      setOpenTicket(res.data._id);
    } catch (e) {
      console.error("Create ticket failed", e);
    }
  };

  if (displayedTickets.length === 0) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Tickets</h2>
          <Button
            onClick={handleCreateTicket}
            className="flex items-center gap-2 bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition"
          >
            <FiPlus size={18} /> New Ticket
          </Button>
        </header>
        <main className="px-4 py-4">
          <p className="text-gray-500 italic">No tickets found. Create your first ticket!</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with New Ticket button */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">My Tickets</h2>
        <Button
          onClick={handleCreateTicket}
          className="flex items-center gap-2 bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition"
        >
          <FiPlus size={18} /> New Ticket
        </Button>
      </header>

      {/* Tickets List - card format only */}
      <main className="px-4 py-4">
        {displayedTickets.map((ticket) => {
          const isResolvedClosed = ticket.isResolvedClosed;
          const opacity = ticket.opacity;

          return (
            <div
              key={ticket._id}
              className={`border rounded-lg p-4 mb-3 cursor-pointer transition ${opacity}`}
              onClick={() => setOpenTicket(ticket._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <StatusBadge status={ticket.status} />
                  <h3 className="text-sm font-medium text-gray-900 truncate mt-1 line-clamp-1 line-clamp-width={300}">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Created {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  {ticket.assignedTo && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Assigned to {ticket.assignedTo.fullname}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 capitalize">{ticket.status}</span>
              </div>

              {/* Reduced opacity for resolved/closed */}
              {isResolvedClosed && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    {ticket.status === "resolved"
                      ? "Resolved on " + new Date(ticket.resolvedAt).toLocaleDateString()
                      : "Closed on " + new Date(ticket.closedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Click to open detail view */}
            </div>
          );
        })}

        {/* Detail view when a ticket is clicked */}
        {openTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">
                Ticket #{openTicket.toString().slice(-6)}
              </h3>

              {/* Comments section */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Comments</h4>
                {loading ? (
                  <p>Loading comments...</p>
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const content = e.target.comment.value;
                  if (!content.trim()) return;
                  try {
                    await axiosClient.post(
                      `/tickets/${openTicket}/comments`,
                      { content },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    loadTickets();
                    setOpenTicket(null);
                    e.target.comment.value = "";
                  } catch (err) {
                    console.error("Comment failed", err);
                  }
                }}
              >
                <textarea
                  name="comment"
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <Button type="submit" className="mt-2 w-full bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition">
                  Post
                </Button>
              </form>

              <button
                onClick={() => setOpenTicket(null)}
                className="mt-4 text-sm text-indigo-600 underline float-right"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubmitterDashboard;