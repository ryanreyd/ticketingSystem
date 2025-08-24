import { useState, useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiFileText,
  FiLogOut,
  FiUser,
  FiUsers,
  FiGrid,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useContext(AuthContext);

  const location = useLocation();

  const MenuItem = ({
    label = "menu item name",
    type = "button",
    link,
    onClick,
    icon,
    isActive,
    className,
  }) => {
    const linkStyle = "flex items-center gap-3 hover:text-blue-500 py-1";

    return type === "button" ? (
      <button
        onClick={onClick}
        className="flex items-center gap-3 text-gray-670 hover:text-blue-500 py-1"
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </button>
    ) : (
      <Link
        to={link}
        className={
          isActive
            ? ` text-blue-500  ${linkStyle} ${className}`
            : ` ${linkStyle} ${className}`
        }
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 ">
      {/* Sidebar */}
      <div
        className={`relative bg-white shadow-lg transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Menu Toggle */}
        <button
          className="p-4 focus:outline-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <FiMenu size={20} />
        </button>

        {/* Menu Items */}

        <nav className="flex flex-col gap-4 p-4">
          <MenuItem
            label="Dasboard"
            type="link"
            link="/dashboard"
            icon={<FiGrid />}
            isActive={location.pathname === "/dashboard"}
          />
          <MenuItem
            label="Tickets Management"
            type="link"
            link="/ticketsManagement"
            icon={<FiFileText />}
            isActive={location.pathname === "/ticketsManagement"}
          />
          <MenuItem
            label="Users Management"
            type="link"
            link="/usersManagement"
            icon={<FiUsers />}
            isActive={location.pathname === "/userManagement"}
            className={user?.role === "admin" ? "" : "hidden"}
          />
          <MenuItem
            label="Logout"
            type="button"
            onClick={logout}
            icon={<FiLogOut />}
          />
        </nav>
        {/* User Profile */}
        <div
          className={
            collapsed
              ? `hidden`
              : `flex flex-col w-full h-1/5 bg-white absolute bottom-0 gap-4 items-center justify-center`
          }
        >
          <div className="h-[100px] w-[100px] flex items-center justify-center rounded-full bg-white shadow-2xl ">
            <FiUser size={30} color="#636363" />
          </div>
          <div className="text-center">
            <h1 className="font-semibold">{user?.fullname}</h1>
            <p className="text-sm font-thin">
              {user?.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Outlet /> {/* Renders the current page inside layout */}
      </div>
    </div>
  );
};

export default Layout;
