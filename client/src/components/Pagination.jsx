import React from "react";

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = page - delta; i <= page + delta; i++) {
      if (i > 0 && i <= pages) {
        range.push(i);
      }
    }

    if (range[0] > 1) {
      rangeWithDots.push(1);
      if (range[0] > 2) rangeWithDots.push("...");
    }

    rangeWithDots.push(...range);

    if (rangeWithDots[rangeWithDots.length - 1] < pages) {
      if (rangeWithDots[rangeWithDots.length - 1] < pages - 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(pages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      <div className="flex gap-1">
        {getPageNumbers().map((p, idx) => (
          <button
            key={idx}
            onClick={() => typeof p === "number" && onPageChange(p)}
            disabled={p === "..."}
            className={`px-3 py-1 border rounded-md ${
              p === page ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-gray-50"
            } ${p === "..." ? "cursor-default" : ""}`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
