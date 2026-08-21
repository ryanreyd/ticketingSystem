import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const BUFFER = 12;

const KEBAB_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const DropdownMenu = ({ trigger, triggerClassName = "", actions, children, align = "right" }) => {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const positionDropdown = () => {
      const triggerEl = triggerRef.current;
      const dropdown = dropdownRef.current;
      if (!triggerEl || !dropdown) return;

      const triggerRect = triggerEl.getBoundingClientRect();
      const dropdownHeight = dropdown.offsetHeight;

      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      let top;
      if (spaceBelow < dropdownHeight + BUFFER && spaceAbove > dropdownHeight) {
        top = triggerRect.top - dropdownHeight - BUFFER;
      } else {
        top = triggerRect.bottom + BUFFER;
      }

      const style = { position: "fixed", top: `${top}px` };
      if (align === "right") {
        style.right = `${window.innerWidth - triggerRect.right}px`;
      } else {
        style.left = `${triggerRect.left}px`;
      }

      setDropdownStyle(style);
    };

    const raf = requestAnimationFrame(positionDropdown);
    const timeout = setTimeout(positionDropdown, 50);

    window.addEventListener("resize", positionDropdown);
    window.addEventListener("scroll", positionDropdown, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      window.removeEventListener("resize", positionDropdown);
      window.removeEventListener("scroll", positionDropdown);
    };
  }, [open, align]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const triggerEl = triggerRef.current;
      const dropdown = dropdownRef.current;
      if (
        (triggerEl && triggerEl.contains(event.target)) ||
        (dropdown && dropdown.contains(event.target))
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const triggerRect = triggerRef.current?.getBoundingClientRect();
  const initialStyle = triggerRect
    ? {
        position: "fixed",
        top: `${triggerRect.bottom + BUFFER}px`,
        ...(align === "right"
          ? { right: `${window.innerWidth - triggerRect.right}px` }
          : { left: `${triggerRect.left}px` }),
      }
    : {};

  const renderTrigger = () => {
    if (trigger) {
      return (
        <div ref={triggerRef} onClick={() => setOpen(!open)} className="cursor-pointer">
          {trigger}
        </div>
      );
    }
    return (
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className={`p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition ${triggerClassName}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {KEBAB_SVG}
      </button>
    );
  };

  return (
    <div className="relative">
      {renderTrigger()}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] py-1 text-sm"
            role="menu"
            style={{ ...initialStyle, ...dropdownStyle }}
          >
            {actions
              ? actions.map((action, idx) => {
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
                })
              : children}
          </div>,
          document.body
        )}
    </div>
  );
};

export default DropdownMenu;
