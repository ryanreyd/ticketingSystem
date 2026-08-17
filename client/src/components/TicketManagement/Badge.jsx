const Badge = ({ children, color = "gray" }) => {
  const colorMap = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color] || colorMap.gray}`}>
      {children}
    </span>
  );
};

export default Badge;
