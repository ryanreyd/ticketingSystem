import { useState, useCallback, useMemo } from "react";
import Badge from "./Badge";
import ActionMenu from "./ActionMenu";
import ConfirmDialog from "../ConfirmDialog";
import StatusProgressIndicator from "../shared/StatusProgressIndicator";
import { FiClock } from "react-icons/fi";
import {
  LuBuilding2,
  LuChevronRight,
  LuChevronUp,
  LuChevronDown,
  LuCheck,
  LuUserRound,
  LuHeadset,
  LuArrowRight,
  LuTrash2,
} from "react-icons/lu";
import {
  formatStatus,
  formatPriority,
  statusColor,
  priorityMeta,
  timeAgo,
  formatDate,
} from "./utils";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const MAX_DESCRIPTION_LENGTH = 120;
const ACTION_INTERACTION_CLASS = "ticket-card-action";

const AVATAR_TONES = [
  "bg-gradient-to-br from-indigo-500 to-violet-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
];

const initials = (name) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const truncate = (text, maxLength) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;

const Avatar = ({ name, tone, size = "h-6 w-6 text-[10px]" }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-white ${size} ${tone}`}
    title={name}
  >
    {initials(name)}
  </div>
);

const TicketCard = ({ ticket, onClick, isSelected, onStatusChange, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const ticketNumber = ticket?.ticketNumber || (ticket?._id ? `…${ticket._id.slice(-6)}` : "—");

  const description = ticket?.description || "";
  const hasDescription = Boolean(description);
  const needsToggle = description.length > MAX_DESCRIPTION_LENGTH;
  const displayedDescription = useMemo(
    () => (isExpanded ? description : truncate(description, MAX_DESCRIPTION_LENGTH)),
    [description, isExpanded]
  );

  const pMeta = priorityMeta[ticket?.priority] || priorityMeta.low;

  const branchName = ticket?.createdBy?.branch?.name || ticket?.createdBy?.branch?.code || "";
  const departmentName = ticket?.createdBy?.department?.name || ticket?.createdBy?.department?.code || "";
  const showLocation = Boolean(branchName || departmentName);

  // Resolution time lives inside the status Badge, so compute it here only.
  // Guarded so non-terminal statuses (or missing timestamps) never render
  // "0h"/"NaN".
  const resolutionHrs = useMemo(() => {
    if (!ticket) return null;
    const isTerminal = ticket.status === "resolved" || ticket.status === "closed";
    if (!isTerminal || !ticket.resolvedAt || !ticket.createdAt) return null;
    const diff = Math.round(
      (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / 36e5
    );
    return Number.isFinite(diff) && diff > 0 ? diff : null;
  }, [ticket]);

  const menuActions = useMemo(() => {
    const actions = [];

    if (onStatusChange) {
      STATUS_OPTIONS.forEach((opt) => {
        const isActive = opt.value === ticket?.status;
        actions.push({
          label: opt.label,
          shortcut: isActive ? "✓" : undefined,
          disabled: isActive,
          onClick: () => {
            if (isActive) return;
            onStatusChange(ticket, opt.value);
          },
        });
      });
    }

    if (onDelete) {
      if (actions.length) actions.push({ type: "separator" });
      actions.push({
        label: "Delete Ticket",
        icon: <LuTrash2 size={16} />,
        destructive: true,
        onClick: () => setConfirmDeleteOpen(true),
      });
    }

    return actions;
  }, [onStatusChange, onDelete, ticket]);

  const hasActions = menuActions.length > 0;

  const handleCardClick = useCallback(
    (e) => {
      if (e.target.closest(`.${ACTION_INTERACTION_CLASS}`)) return;
      onClick?.(ticket);
    },
    [ticket, onClick]
  );

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete?.(ticket);
    setConfirmDeleteOpen(false);
  }, [ticket, onDelete]);

  return (
    <>
      <div
        className={`group relative flex w-full items-start rounded-2xl bg-white p-1.5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-slate-200/70 transition-all ${
          isSelected
            ? "ring-indigo-400 shadow-indigo-100/50"
            : isHovered
              ? "shadow-[0_8px_24px_rgba(16,24,40,0.08)] ring-slate-300/80 -translate-y-0.5"
              : ""
        }`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Priority signature bar — fast-scan colour channel */}
        <div
          className={`w-1 shrink-0 bg-gradient-to-b ${pMeta?.bar || "from-slate-300 to-slate-400"}`}
        />

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          {/* Eyebrow: number · location, category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <span className="font-mono tracking-normal text-slate-500 group-hover:text-indigo-500 transition-colors">
                #{ticketNumber}
              </span>
              {showLocation && (
                <>
                  <span className="h-2.5 w-px bg-slate-200" />
                  <LuBuilding2 size={10} className="text-slate-300" />
                  <span>{branchName || "N/A"}</span>
                  <span className="text-slate-300">·</span>
                  <span>{departmentName || "N/A"}</span>
                </>
              )}
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                pMeta?.pill || "text-slate-600 ring-slate-200 bg-slate-50/80"
              }`}
            >
              {formatPriority(ticket?.priority) || "Priority"}
            </span>
          </div>

          <h3 className="text-sm font-semibold leading-snug tracking-tight text-slate-900">
            {ticket?.title || "Untitled ticket"}
          </h3>

          {hasDescription && (
            <p
              className="text-xs text-slate-600 leading-relaxed"
              title={isExpanded ? description : undefined}
            >
              {displayedDescription}
              {needsToggle && (
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className={`ml-1 inline-flex items-center gap-0.5 align-bottom text-slate-400 hover:text-slate-700 ${ACTION_INTERACTION_CLASS}`}
                  aria-label={isExpanded ? "Show less" : "Show more"}
                >
                  {isExpanded ? (
                    <LuChevronUp size={12} />
                  ) : (
                    <LuChevronDown size={12} />
                  )}
                  <span className="text-[10px] font-medium">
                    {isExpanded ? "Less" : "More"}
                  </span>
                </button>
              )}
            </p>
          )}

          {/* Status row: status badge (with resolution time) + stepper, timestamp */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Badge color={statusColor[ticket?.status] || "gray"}>
                <span className="inline-flex items-center gap-1">
                  <span>{formatStatus(ticket?.status)}</span>
                  {resolutionHrs && (
                    <span className="inline-flex items-center gap-1 opacity-75">
                      <span>·</span>
                      <FiClock size={9} />
                      <span>{resolutionHrs}h</span>
                    </span>
                  )}
                </span>
              </Badge>
              <StatusProgressIndicator currentStatus={ticket?.status} />
            </div>
            <span
              className="text-[11px] text-slate-400"
              title={formatDate(ticket?.createdAt)}
            >
              {timeAgo(ticket?.createdAt)}
            </span>
          </div>

          {/* Footer: submitter → assignee */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <div
                className="flex items-center gap-1"
                title={`Submitted by ${ticket?.createdBy?.fullname || "Unknown"}`}
              >
                <LuUserRound size={10} className="text-slate-300" />
                <Avatar
                  name={ticket?.createdBy?.fullname || "Unknown"}
                  tone={AVATAR_TONES[0]}
                  size="h-5 w-5 text-[9px]"
                />
                <span className="font-medium text-slate-600">
                  {ticket?.createdBy?.fullname || "Unknown"}
                </span>
              </div>
              {ticket?.assignedTo && (
                <>
                  <LuArrowRight size={11} className="mx-0.5 text-slate-300" />
                  <div
                    className="flex items-center gap-1"
                    title={`Assigned to ${ticket.assignedTo.fullname}`}
                  >
                    <LuHeadset size={10} className="text-slate-300" />
                    <Avatar
                      name={ticket.assignedTo.fullname}
                      tone={AVATAR_TONES[1]}
                      size="h-5 w-5 text-[9px]"
                    />
                    <span className="font-medium text-slate-800">
                      {ticket.assignedTo.fullname}
                    </span>
                  </div>
                </>
              )}
              {ticket?.status === "resolved" && (
                <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">
                  <LuCheck size={8} strokeWidth={3} />
                  Done
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {hasActions && (
                <span className={ACTION_INTERACTION_CLASS} onClick={(e) => e.stopPropagation()}>
                  <ActionMenu actions={menuActions} />
                </span>
              )}
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-slate-300 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <LuChevronRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Ticket"
        message={`Are you sure you want to delete "${
          ticket?.title || "this ticket"
        }"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </>
  );
};

export default TicketCard;
