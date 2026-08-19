import Badge from "./Badge";
import StatusProgressIndicator from "../shared/StatusProgressIndicator";
import { formatStatus, formatPriority, priorityColor, statusColor } from "./utils";

const TicketCard = ({ ticket, onClick, isSelected }) => {
  return (
    <div
      onClick={() => onClick(ticket)}
      className={`bg-white border rounded-lg p-4 cursor-pointer transition hover:shadow-md ${isSelected ? "border-blue-400 ring-1 ring-blue-400 shadow-sm" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber || ticket._id.slice(-6)}</span>
            <Badge color={statusColor[ticket.status] || "gray"}>{formatStatus(ticket.status)}</Badge>
            <StatusProgressIndicator currentStatus={ticket.status} />
            <Badge color={priorityColor[ticket.priority] || "gray"}>{formatPriority(ticket.priority)}</Badge>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 truncate">{ticket.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {ticket.createdBy?.fullname || "Unknown"} &middot; {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
          {ticket.assignedTo && (
            <p className="text-xs text-gray-500 mt-0.5">
              Assigned to {ticket.assignedTo.fullname}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
