// Button.js
import React from "react";

const Button = ({ type = "button", onClick, children, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
