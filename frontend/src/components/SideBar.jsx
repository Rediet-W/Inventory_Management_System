import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaStore,
  FaUserFriends,
  FaClipboardList,
  FaShoppingCart,
  FaBoxOpen,
  FaChartLine,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaListAlt,
  FaExchangeAlt,
  FaUsers,
  FaChartBar,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const Sidebar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({}); // Track open/closed state of groups
  const location = useLocation();

  if (!userInfo) {
    return null;
  }

  // Toggle dropdown for a group
  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group], // Toggle the group's open state
    }));
  };

  // Define sidebar groups and their links based on user role
  const sidebarGroups = [
    {
      label: "Shop",
      icon: <FaStore />,
      links: [
        userInfo?.role !== "superadmin" && {
          to: "/sales",
          label: "Add Sales",
          icon: <FaShoppingCart />,
        },
        userInfo?.role !== "superadmin" && {
          to: "/shopcard",
          label: "Shop Card",
          icon: <FaListAlt />,
        },
        userInfo?.role !== "superadmin" && {
          to: "/shop",
          label: "Shop Inventory",
          icon: <FaStore />,
        },
        userInfo?.role !== "superadmin" && {
          to: "/requested",
          label: "Requested",
          icon: <FaClipboardList />,
        },
      ].filter(Boolean),
      roles: ["user", "admin"],
    },
    {
      label: "Store",
      icon: <FaBoxOpen />,
      links: [
        userInfo?.role === "admin" && {
          to: "/add-products",
          label: "Purchases",
          icon: <FaBoxOpen />,
        },
        userInfo?.role === "admin" && {
          to: "/stockcard",
          label: "Stock Card",
          icon: <FaListAlt />,
        },
        userInfo?.role === "admin" && {
          to: "/store",
          label: "Inventory List",
          icon: <FaStore />,
        },
        userInfo?.role === "admin" && {
          to: "/transfer",
          label: "Transfer to Shop",
          icon: <FaExchangeAlt />,
        },
      ].filter(Boolean),
      roles: ["admin"],
    },
    {
      label: "Management",
      icon: <FaUserFriends />,
      links: [
        userInfo?.isPrimaryAdmin && {
          to: "/management",
          label: "Management",
          icon: <FaUserFriends />,
        },
        userInfo?.isPrimaryAdmin && {
          to: "/employees",
          label: "Employees",
          icon: <FaUsers />,
        },
        userInfo?.role === "admin" && {
          to: "/summary",
          label: "Summary",
          icon: <FaClipboardList />,
        },
        userInfo?.role === "admin" && {
          to: "/analysis",
          label: "Analysis",
          icon: <FaChartBar />,
        },
      ].filter(Boolean),
      roles: ["admin"],
    },
  ].filter((group) => group.roles.includes(userInfo?.role));

  return (
    <div
      className={`sidebar-container min-h-screen max-h-fit ${
        isCollapsed ? "collapsed" : ""
      }`}
      style={{
        width: isCollapsed ? "80px" : "250px",
        background: "#0076f5",
        position: "sticky",
        top: 0,
        left: 0,
        transition: "width 0.3s ease",
        zIndex: 1000,
        minHeight: "fit-content",
      }}
    >
      <button
        className="btn toggle-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "absolute",
          top: "10px",
          right: isCollapsed ? "-40px" : "-20px",
          background: "#60adff",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          zIndex: 1001,
        }}
      >
        {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
      </button>

      {/* Sidebar Links */}
      <ul className="nav flex-column" style={{ padding: "10px" }}>
        {/* Dashboard (Standalone Link) */}
        <li className="nav-item">
          <Link
            to="/"
            className={`nav-link d-flex align-items-center ${
              location.pathname === "/" ? "bg-white text-black" : "text-light"
            }`}
            style={{
              padding: "10px",
              transition: "background 0.3s",
              borderRadius: "4px",
              background: location.pathname === "/" ? "#0056b3" : "transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0056b3")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                location.pathname === "/" ? "#0056b3" : "transparent")
            }
          >
            <FaHome />
            {!isCollapsed && <span className="ms-2">Dashboard</span>}
          </Link>
        </li>

        {/* Summary (Standalone Link for Superadmin) */}
        {userInfo?.role === "superadmin" && (
          <li className="nav-item">
            <Link
              to="/summary"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/summary"
                  ? "bg-white text-black"
                  : "text-light"
              }`}
              style={{
                padding: "10px",
                transition: "background 0.3s",
                borderRadius: "4px",
                background:
                  location.pathname === "/summary" ? "#0056b3" : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#0056b3")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  location.pathname === "/summary" ? "#0056b3" : "transparent")
              }
            >
              <FaClipboardList />
              {!isCollapsed && <span className="ms-2">Summary</span>}
            </Link>
          </li>
        )}

        {/* Grouped Sections (Shop, Store, Management) */}
        {userInfo?.role !== "superadmin" &&
          sidebarGroups.map((group) => (
            <li className="nav-item" key={group.label}>
              {/* Group Header */}
              <div
                className="d-flex align-items-center justify-content-between"
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  color: "white",
                  fontWeight: "bold",
                }}
                onClick={() => toggleGroup(group.label)}
              >
                <div className="d-flex align-items-center">
                  {group.icon}
                  {!isCollapsed && <span className="ms-2">{group.label}</span>}
                </div>
                {!isCollapsed &&
                  (openGroups[group.label] ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  ))}
              </div>

              {/* Group Links */}
              {!isCollapsed && openGroups[group.label] && (
                <ul style={{ paddingLeft: "20px", listStyle: "none" }}>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className={`nav-link d-flex align-items-center ${
                          location.pathname === link.to
                            ? "bg-white text-black"
                            : "text-light"
                        }`}
                        style={{
                          padding: "10px",
                          transition: "background 0.3s",
                          borderRadius: "4px",
                          background:
                            location.pathname === link.to
                              ? "#0056b3"
                              : "transparent",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#0056b3")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            location.pathname === link.to
                              ? "#0056b3"
                              : "transparent")
                        }
                      >
                        {link.icon}
                        <span className="ms-2">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
