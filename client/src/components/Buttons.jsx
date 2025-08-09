// Button.js
import React from "react";

const Button = ({ type = "button", onClick, children, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
