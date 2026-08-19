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

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const timeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return formatDate(date);
};

export { formatStatus, formatPriority, priorityColor, statusColor, timeAgo, formatDate };
