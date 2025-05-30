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
          to: "/dailysales",
          label: "Daily Sales",
          icon: <FaChartLine />,
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
      className={`sidebar-container min-h-screen ${
        isCollapsed ? "collapsed" : ""
      }`}
      style={{
        width: isCollapsed ? "80px" : "250px",
        background: "linear-gradient(180deg, #1E43FA 0%, #0A2DB5 100%)",
        position: "sticky",
        top: 0,
        left: 0,
        transition: "width 0.3s ease",
        zIndex: 1000,
        minHeight: "fit-content",
        boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <button
        className="btn toggle-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "absolute",
          top: "20px",
          right: isCollapsed ? "-40px" : "-20px",
          background: "#3A5BFF",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          zIndex: 1001,
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#4D6BFF";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#3A5BFF";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
      </button>

      {/* Sidebar Links */}
      <ul className="nav flex-column" style={{ padding: "20px 10px" }}>
        {/* Dashboard (Standalone Link) */}
        <li className="nav-item" style={{ marginBottom: "8px" }}>
          <Link
            to="/"
            className={`nav-link d-flex align-items-center ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            style={{
              padding: "12px 15px",
              transition: "all 0.3s ease",
              borderRadius: "8px",
              color: "rgba(255, 255, 255, 0.9)",
              textDecoration: "none",
              background:
                location.pathname === "/dashboard"
                  ? "rgba(255, 255, 255, 0.15)"
                  : "transparent",
            }}
            onMouseEnter={(e) =>
              location.pathname !== "/dashboard" &&
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                location.pathname === "/dashboard"
                  ? "rgba(255, 255, 255, 0.15)"
                  : "transparent")
            }
          >
            <div
              style={{
                width: "24px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <FaHome />
            </div>
            {!isCollapsed && (
              <span
                style={{
                  marginLeft: "12px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                Dashboard
              </span>
            )}
          </Link>
        </li>

        {/* Summary (Standalone Link for Superadmin) */}
        {userInfo?.role === "superadmin" && (
          <li className="nav-item" style={{ marginBottom: "8px" }}>
            <Link
              to="/summary"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/summary" ? "active" : ""
              }`}
              style={{
                padding: "12px 15px",
                transition: "all 0.3s ease",
                borderRadius: "8px",
                color: "rgba(255, 255, 255, 0.9)",
                textDecoration: "none",
                background:
                  location.pathname === "/summary"
                    ? "rgba(255, 255, 255, 0.15)"
                    : "transparent",
              }}
              onMouseEnter={(e) =>
                location.pathname !== "/summary" &&
                (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  location.pathname === "/summary"
                    ? "rgba(255, 255, 255, 0.15)"
                    : "transparent")
              }
            >
              <div
                style={{
                  width: "24px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <FaClipboardList />
              </div>
              {!isCollapsed && (
                <span
                  style={{
                    marginLeft: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Summary
                </span>
              )}
            </Link>
          </li>
        )}

        {/* Grouped Sections (Shop, Store, Management) */}
        {userInfo?.role !== "superadmin" &&
          sidebarGroups.map((group) => (
            <li
              className="nav-item"
              key={group.label}
              style={{ marginBottom: "8px" }}
            >
              {/* Group Header */}
              <div
                className="d-flex align-items-center justify-content-between"
                style={{
                  padding: "12px 15px",
                  cursor: "pointer",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: "500",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
                onClick={() => toggleGroup(group.label)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "24px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {group.icon}
                  </div>
                  {!isCollapsed && (
                    <span style={{ marginLeft: "12px", fontSize: "0.9rem" }}>
                      {group.label}
                    </span>
                  )}
                </div>
                {!isCollapsed &&
                  (openGroups[group.label] ? (
                    <FaChevronUp size={12} />
                  ) : (
                    <FaChevronDown size={12} />
                  ))}
              </div>

              {/* Group Links */}
              {!isCollapsed && openGroups[group.label] && (
                <ul
                  style={{
                    paddingLeft: "36px",
                    listStyle: "none",
                    marginTop: "4px",
                  }}
                >
                  {group.links.map((link) => (
                    <li key={link.to} style={{ marginBottom: "4px" }}>
                      <Link
                        to={link.to}
                        className={`nav-link d-flex align-items-center ${
                          location.pathname === link.to ? "active" : ""
                        }`}
                        style={{
                          padding: "10px 15px",
                          transition: "all 0.3s ease",
                          borderRadius: "8px",
                          color: "rgba(255, 255, 255, 0.8)",
                          textDecoration: "none",
                          fontSize: "0.85rem",
                          background:
                            location.pathname === link.to
                              ? "rgba(255, 255, 255, 0.15)"
                              : "transparent",
                        }}
                        onMouseEnter={(e) =>
                          location.pathname !== link.to &&
                          (e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            location.pathname === link.to
                              ? "rgba(255, 255, 255, 0.15)"
                              : "transparent")
                        }
                      >
                        <div
                          style={{
                            width: "20px",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {link.icon}
                        </div>
                        <span style={{ marginLeft: "12px" }}>{link.label}</span>
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
