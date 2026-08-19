const STATUS_TABS = [
  { value: "", label: "All", color: "gray" },
  { value: "open", label: "Open", color: "sky" },
  { value: "in_progress", label: "In Progress", color: "indigo" },
  { value: "resolved", label: "Resolved", color: "emerald" },
  { value: "closed", label: "Closed", color: "slate" },
];

const ACTIVE_COLORS = {
  gray: "bg-gray-700",
  sky: "bg-sky-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-500",
};

const StatusTabBar = ({ activeStatus, counts, onChange }) => {
  return (
    <div className="inline-flex items-center gap-1 overflow-x-auto min-w-0 py-1">
      {STATUS_TABS.map((tab) => {
        const isActive = activeStatus === tab.value;
        const count = tab.value === "" ? counts.all : (counts[tab.value] || 0);
        return (
          <button
            key={tab.value || "all"}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
              ${isActive
                ? `${ACTIVE_COLORS[tab.color]} text-white`
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {tab.label}
            <span className="text-xs font-medium">({count})</span>
          </button>
        );
      })}
    </div>
  );
};

export default StatusTabBar;
