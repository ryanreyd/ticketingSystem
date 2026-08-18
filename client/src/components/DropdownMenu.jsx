import React, { useEffect, useRef, useState } from "react";

const BUFFER = 12;

const findScrollableParent = (el) => {
  let node = el.parentElement;
  while (node) {
    if (node === document.body || node === document.documentElement) return window;
    const style = getComputedStyle(node);
    if (style.overflowY === "auto" || style.overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return window;
};

const DropdownMenu = ({ trigger, children, align = "right" }) => {
  const [open, setOpen] = useState(false);
  const [placeTop, setPlaceTop] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const measureAndPosition = () => {
    const container = containerRef.current;
    const dropdown = dropdownRef.current;
    if (!container || !dropdown) return;

    const triggerRect = container.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();
    const dropdownHeight = dropdownRect.height || dropdown.offsetHeight || 200;

    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    setPlaceTop(spaceBelow < dropdownHeight + BUFFER && spaceAbove > dropdownHeight);
  };

  useEffect(() => {
    if (!open) {
      setPlaceTop(false);
      return;
    }

    let raf, timeout;

    raf = requestAnimationFrame(() => {
      measureAndPosition();
    });

    timeout = setTimeout(() => {
      measureAndPosition();
    }, 50);

    const scrollEl = containerRef.current ? findScrollableParent(containerRef.current) : window;

    const handleScroll = () => measureAndPosition();
    const handleResize = () => measureAndPosition();

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      scrollEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 transition-all duration-150 ${
            align === "right" ? "right-0" : "left-0"
          } ${
            placeTop ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
