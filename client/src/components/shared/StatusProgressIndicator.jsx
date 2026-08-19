const STATUS_COLORS = {
  open: "bg-sky-500",
  in_progress: "bg-indigo-500",
  pending: "bg-gray-400",
  resolved: "bg-emerald-500",
  closed: "bg-slate-400",
  reopened: "bg-orange-400",
};

const DEFAULT_STATUS_LIST = ["open", "in_progress", "resolved", "closed"];

const StatusProgressIndicator = ({ currentStatus, statusList = DEFAULT_STATUS_LIST }) => {
  const currentIndex = statusList.indexOf(currentStatus);

  return (
    <div
      className="inline-flex items-center"
      title={`Status: ${currentStatus || "unknown"}`}
    >
      {statusList.map((status, index) => {
        const isReached = currentIndex !== -1 && index <= currentIndex;
        const colorClass = STATUS_COLORS[status] || "bg-gray-400";
        const fillClass = isReached ? colorClass : "bg-gray-200";

        return (
          <span key={status} className="flex items-center">
            {index > 0 && (
              <span
                className={`h-0.5 w-3 ${isReached ? colorClass : "bg-gray-200"}`}
              />
            )}
            <span className={`block w-2 h-2 rounded-full ${fillClass}`} />
          </span>
        );
      })}
    </div>
  );
};

export default StatusProgressIndicator;
