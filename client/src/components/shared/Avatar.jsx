const Avatar = ({ initials, seed, className, size = "sm" }) => {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xs: "w-4 h-4",
  };

  const sizeClass = sizeMap[size] || sizeMap.sm;
  const seedValue = seed || initials || "user";
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seedValue)}&font-size=0.5&uppercase=true`;

  return (
    <img
      src={avatarUrl}
      alt={initials || "User"}
      className={`rounded-full object-cover ${sizeClass} ${className || ""}`}
      crossOrigin="anonymous"
    />
  );
};

export default Avatar;
