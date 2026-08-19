import React, { useState, useRef, useEffect } from "react";

const ActionMenu = ({ actions, triggerClassName = "" }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition ${triggerClassName}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 text-sm"
          role="menu"
        >
          {actions.map((action, idx) => {
            if (action.type === "separator") {
              return <div key={`sep-${idx}`} className="border-t border-gray-100 my-1" />;
            }
            const isDestructive = action.destructive;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                disabled={action.disabled}
                className={`w-full text-left px-4 py-2 transition flex items-center justify-between ${
                  isDestructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50"
                } ${action.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                role="menuitem"
              >
                <span className="inline-flex items-center gap-2">
                  {action.icon}
                  <span>{action.label}</span>
                </span>
                {action.shortcut && <span className="text-xs text-gray-400">{action.shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
