const priorityColor = {
  low: "gray",
  medium: "blue",
  high: "amber",
  urgent: "red",
};

const statusColor = {
  open: "sky",
  in_progress: "indigo",
  pending: "gray",
  resolved: "emerald",
  closed: "slate",
  reopened: "orange",
};

const formatStatus = (status) => {
  const map = {
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
    reopened: "Reopened",
  };
  return map[status] || status;
};

const formatPriority = (priority) => {
  const map = {
    low: "Low",
    medium: "Normal",
    high: "High",
    urgent: "Urgent",
  };
  return map[priority] || priority;
};

export { formatStatus, formatPriority, priorityColor, statusColor };
