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

const priorityMeta = {
  urgent: { pill: "text-red-700 ring-red-200 bg-red-50/80", bar: "from-red-400 to-red-600" },
  high: { pill: "text-orange-700 ring-orange-200 bg-orange-50/80", bar: "from-orange-400 to-orange-600" },
  medium: { pill: "text-indigo-700 ring-indigo-200 bg-indigo-50/80", bar: "from-indigo-300 to-indigo-500" },
  low: { pill: "text-slate-600 ring-slate-200 bg-slate-50/80", bar: "from-slate-300 to-slate-400" },
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

export { formatStatus, formatPriority, priorityColor, statusColor, priorityMeta, timeAgo, formatDate };
