import React from "react";

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
};

const DEFAULT_STATUS_LIST = ["open", "in_progress", "resolved", "closed"];

/**
 * Compact status stepper. Renders a row of segmented bars — filled up to the
 * current status position — to communicate workflow progress at a glance.
 * The colour meaning of the status itself is conveyed separately (dot + label)
 * so this indicator stays a neutral positional cue.
 */
const StatusProgressIndicator = ({ currentStatus, statusList = DEFAULT_STATUS_LIST }) => {
  const activeIndex = statusList.indexOf(currentStatus);
  const index = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div
      className="flex items-center gap-[3px]"
      title={`Status: ${STATUS_LABELS[currentStatus] || currentStatus}`}
    >
      {statusList.map((status, i) => (
        <div
          key={status}
          className={`h-[3px] w-4 rounded-full transition-colors ${
            i <= index ? "bg-slate-800" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
};

export default StatusProgressIndicator;
