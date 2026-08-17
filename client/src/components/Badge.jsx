const Badge = ({ children, variant = "default" }) => {
  const styles = {
    admin: "bg-purple-100 text-purple-700",
    support: "bg-blue-100 text-blue-700",
    user: "bg-gray-100 text-gray-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
};

export default Badge;
