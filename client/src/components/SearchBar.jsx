import { useState, useRef, useEffect, memo } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = ({ onSearch, placeholder = "Search...", delay = 300 }) => {
  const [inputValue, setInputValue] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (value) => {
    setInputValue(value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
      timeoutRef.current = null;
    }, delay);
  };

  const handleClear = () => {
    setInputValue("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onSearch("");
  };

  return (
    <div className="relative">
      <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-300 focus:border"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default memo(SearchBar);
