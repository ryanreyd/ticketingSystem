const StatusBadge = ({ status }) => {
  const styles = {
    urgent: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-green-100 text-green-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-green-100 text-green-800",
    reopened: "bg-amber-100 text-amber-800",
    open: "bg-gray-100 text-gray-800",
    in_progress: "bg-indigo-100 text-indigo-800",
    pending: "bg-gray-100 text-gray-800",
  };

  const labels = {
    urgent: "Urgent",
    medium: "Medium",
    low: "Low",
    resolved: "Resolved",
    closed: "Closed",
    reopened: "Reopened",
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
  };

  const className = styles[status] || styles.default;
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${className}`}>
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;