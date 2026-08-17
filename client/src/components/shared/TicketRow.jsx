const priorityStyles = {
  urgent: "text-red-600",
  medium: "text-amber-600",
  low: "text-green-600",
  default: "text-gray-600",
};

const statusStyles = {
  open: "text-sky-600",
  in_progress: "text-indigo-600",
  pending: "text-gray-600",
  resolved: "text-emerald-600",
  closed: "text-slate-600",
  reopened: "text-orange-600",
};

const PriorityBadge = ({ priority }) => {
  const className = priorityStyles[priority] || priorityStyles.default;
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${className}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const className = statusStyles[status] || statusStyles.default;
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Avatar = ({ initials, className, size = "sm" }) => {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xs: "w-4 h-4",
  };
  return (
    <div
      className={`flex items-center justify-center rounded-full ${sizeMap[size] || sizeMap.sm} bg-gray-200 text-gray-600 ${className || ""}`}
    >
      {initials || "•"}
    </div>
  );
};

const TicketRow = ({
  ticket,
  density,
  onView,
  onAssign,
  onPriority,
  onStatus,
  showAssignDropdown = false,
  agents = [],
}) => {
  const isDense = density === "dense" || density === "compact";

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

  return (
    <tr
      className={`align-middle transition-colors ${isDense ? "text-sm" : "text-base"} hover:bg-gray-50`}
    >
      <td className="fw-normal pe-3">
        <span className="text-xs font-mono text-gray-500">
          {ticket.ticketNumber || ticket._id.slice(-6)}
        </span>
      </td>
      <td>
        <StatusBadge status={ticket.status} />
      </td>
      <td className="align-middle">
        <strong className="truncate">
          {ticket.title}
        </strong>
      </td>
      <td>
        <PriorityBadge priority={ticket.priority} />
      </td>
      <td className="align-middle">
        {showAssignDropdown ? (
          <select
            value={ticket.assignedTo?._id || ""}
            onChange={(e) => onAssign(ticket._id, e.target.value)}
            className="ml-1 bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ padding: "4px 8px" }}
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.fullname}
              </option>
            ))}
          </select>
        ) : (
          <Avatar
            initials={ticket.assignedTo?.fullname?.slice(0, 2)}
            size={isDense ? "xs" : "sm"}
          />
        )}
        {(!ticket.assignedTo || density === "dense") && (
          <span className="text-xs text-gray-500 ml-1">Unassigned</span>
        )}
      </td>
      <td className="align-middle">
        <div className="flex flex-wrap items-center gap-1">
          {onStatus && (
            <select
              value={ticket.status}
              onChange={(e) => onStatus(ticket._id, e.target.value)}
              className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {onPriority && (
            <select
              value={ticket.priority}
              onChange={(e) => onPriority(ticket._id, e.target.value)}
              className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
      </td>
      <td>
        {onView && (
          <button
            onClick={() => onView(ticket)}
            className="text-xs text-indigo-600 underline hover:text-indigo-800"
          >
            View
          </button>
        )}
      </td>
    </tr>
  );
};

TicketRow.defaultProps = {
  density: "regular",
  showAssignDropdown: false,
};

export default TicketRow;