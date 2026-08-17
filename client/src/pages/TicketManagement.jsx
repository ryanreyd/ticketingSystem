import { useEffect, useState, useContext, useCallback } from "react";
import { useTickets } from "../hooks/useTickets";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import TicketCard from "../components/TicketManagement/TicketCard";
import TicketDetail from "../components/TicketManagement/TicketDetail";
import Modal from "../components/Modal";
import TextInput from "../components/TextInput";
import { FiLoader, FiPlus } from "react-icons/fi";

const TicketManagement = () => {
  const { user } = useContext(AuthContext);
  const { getTickets, createTicket } = useTickets();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "general",
  });
  const [createErrors, setCreateErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const pageTitle = user?.role === ROLES.USER ? "My Tickets" : "Ticket Management";
  const pageSubtitle = user?.role === ROLES.USER
    ? "View and track your submitted tickets."
    : "View, manage, and track support tickets.";

  const loadTicketsList = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (user?.role === ROLES.USER) params.createdBy = user._id;
      const data = await getTickets(params);
      setTickets(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, [getTickets, statusFilter, priorityFilter, user?.role, user?._id]);

  useEffect(() => {
    loadTicketsList();
  }, [loadTicketsList]);

  const handleOpenCreate = () => setIsCreateOpen(true);

  const handleCloseCreate = () => {
    const hasChanges = createForm.title || createForm.description;
    if (hasChanges && !window.confirm("You have unsaved changes. Discard?")) {
      return;
    }
    setCreateForm({ title: "", description: "", priority: "medium", category: "general" });
    setCreateErrors({});
    setIsCreateOpen(false);
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.title.trim()) errors.title = "Title is required";
    if (!createForm.description.trim()) errors.description = "Description is required";
    return errors;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCreateForm();
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});
    setIsSubmitting(true);
    try {
      await createTicket(createForm);
      loadTicketsList();
      setCreateForm({ title: "", description: "", priority: "medium", category: "general" });
      setIsCreateOpen(false);
    } catch (err) {
      setCreateErrors({ general: err.response?.data?.message || "Failed to create ticket" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">{pageSubtitle}</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white text-sm py-2 px-4 rounded-md hover:bg-indigo-700 transition"
          >
            <FiPlus size={18} /> New Ticket
          </button>
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
          <div className="flex justify-center py-8">
            <FiLoader className="animate-spin text-2xl text-indigo-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 italic">No tickets found.</p>
            {user?.role === ROLES.USER && (
              <button
                onClick={handleOpenCreate}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                Create your first ticket
              </button>
            )}
          </div>
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

        <Modal isOpen={isCreateOpen} onClose={handleCloseCreate} title="Create Ticket">
          <form onSubmit={handleCreateSubmit}>
            {createErrors.general && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {createErrors.general}
              </p>
            )}
            <TextInput
              label="Title"
              name="title"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="Ticket title"
            />
            {createErrors.title && (
              <p className="text-xs text-red-600 -mt-2 mb-3">{createErrors.title}</p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Describe your issue..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-300 focus:border resize-none"
              />
              {createErrors.description && (
                <p className="text-xs text-red-600 -mt-2 mb-3">{createErrors.description}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-300 focus:border bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-300 focus:border bg-white"
              >
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCloseCreate}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default TicketManagement;
