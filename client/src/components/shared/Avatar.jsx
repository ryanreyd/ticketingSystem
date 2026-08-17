const Avatar = ({ initials, className, size = "sm" }) => {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full ${sizeMap[size] || sizeMap.sm} ${
        sizeMap.sm === "w-6 h-6" ? "bg-gray-200 text-gray-600" : ""
      } ${className || ""}`}
    >
      {initials || "•"}
    </div>
  );
};

export default Avatar;