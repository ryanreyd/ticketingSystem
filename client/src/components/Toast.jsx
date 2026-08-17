import React, { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "error" ? "bg-red-500" : type === "warning" ? "bg-amber-500" : "bg-green-500";

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg`}>
      {message}
    </div>
  );
};

export default Toast;
