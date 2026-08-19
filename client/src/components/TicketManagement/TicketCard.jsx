import Badge from "./Badge";
import Avatar from "../shared/Avatar";
import StatusProgressIndicator from "../shared/StatusProgressIndicator";
import { FiMapPin, FiTag } from "react-icons/fi";
import {
  formatStatus,
  formatPriority,
  priorityColor,
  statusColor,
  timeAgo,
  formatDate,
} from "./utils";

const TicketCard = ({ ticket, onClick, isSelected }) => {
  return (
    <div
      onClick={() => onClick(ticket)}
      className={`bg-white border rounded-lg p-4 cursor-pointer transition hover:shadow-md ${isSelected ? "border-blue-400 ring-1 ring-blue-400 shadow-sm" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">
              {ticket.ticketNumber || ticket._id.slice(-6)}
            </span>
            <Badge color={statusColor[ticket.status] || "gray"}>
              {formatStatus(ticket.status)}
            </Badge>
            <StatusProgressIndicator currentStatus={ticket.status} />
            <Badge color={priorityColor[ticket.priority] || "gray"}>
              {formatPriority(ticket.priority)}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {ticket.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Avatar
              seed={ticket.createdBy?._id}
              initials={ticket.createdBy?.fullname?.slice(0, 2)}
              size="sm"
            />
            <span className="text-xs text-gray-500">
              Submitted by {ticket.createdBy?.fullname || "Unknown"} &middot;{" "}
              <span title={formatDate(ticket.createdAt)}>
                {timeAgo(ticket.createdAt)}
              </span>
            </span>
          </div>
          {(ticket.createdBy?.branch || ticket.createdBy?.department) && (
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {ticket.createdBy?.branch && (
                <Badge color="blue">
                  <span className="inline-flex items-center gap-1">
                    <FiMapPin size={12} />
                    {ticket.createdBy?.branch?.name ||
                      ticket.createdBy?.branch?.code ||
                      "N/A"}
                  </span>
                </Badge>
              )}
              {ticket.createdBy?.department && (
                <Badge color="slate">
                  <span className="inline-flex items-center gap-1">
                    <FiTag size={12} />
                    {ticket.createdBy?.department?.name ||
                      ticket.createdBy?.department?.code ||
                      "N/A"}
                  </span>
                </Badge>
              )}
            </div>
          )}
          {ticket.assignedTo && (
            <div className="flex items-center gap-2 mt-1">
              <Avatar
                seed={ticket.assignedTo._id}
                initials={ticket.assignedTo.fullname?.slice(0, 2)}
                size="sm"
                className="ring-2 ring-indigo-400"
              />
              <span className="text-xs text-gray-500">
                Assigned to {ticket.assignedTo.fullname}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
