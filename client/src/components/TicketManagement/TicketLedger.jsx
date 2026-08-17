import { timeAgo } from "./utils";

const TicketLedger = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">No activity yet.</div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <div key={entry._id || idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5" />
            {idx < entries.length - 1 && <div className="w-px h-full bg-gray-200 mt-1" />}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm text-gray-800">
              {entry.actorId?.fullname && (
                <span className="font-medium">{entry.actorId.fullname}</span>
              )}
              {" " + (entry.description || entry.action.replace(/_/g, " "))}
            </p>
            {entry.field && entry.oldValue && entry.newValue && (
              <p className="text-xs text-gray-500 mt-0.5">
                {entry.field}: {entry.oldValue} → {entry.newValue}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">{timeAgo(entry.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketLedger;
