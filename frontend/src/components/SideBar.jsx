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
} from "react-icons/fa";

const Sidebar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  if (!userInfo) {
    return null;
  }
  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

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
      }}
    >
      {/* Toggle Button */}
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
        {/* Function to determine active link */}
        {[
          { to: "/", label: "Dashboard", icon: <FaHome /> },
          userInfo?.role === "superadmin" && {
            to: "/report",
            label: "Report",
            icon: <FaChartLine />,
          },
          userInfo?.role !== "superadmin" && {
            to: "/requested",
            label: "Requested",
            icon: <FaClipboardList />,
          },
          userInfo?.role !== "superadmin" && {
            to: "/sales",
            label: "Add Sales",
            icon: <FaShoppingCart />,
          },
          userInfo?.role !== "superadmin" && {
            to: "/shop",
            label: "Shop Inventory",
            icon: <FaStore />,
          },
          userInfo?.role !== "superadmin" && {
            to: "/shopcard",
            label: "Shop Card",
            icon: <FaStore />,
          },
          userInfo?.role === "admin" && {
            to: "/add-products",
            label: "Add Products",
            icon: <FaBoxOpen />,
          },
          userInfo?.role === "admin" && {
            to: "/store",
            label: "Inventory List",
            icon: <FaStore />,
          },
          userInfo?.role === "admin" && {
            to: "/transfer",
            label: "Transfer to Shop",
            icon: <FaStore />,
          },
          userInfo?.role === "admin" && {
            to: "/stockcard",
            label: "Stock Card",
            icon: <FaStore />,
          },
          userInfo?.isPrimaryAdmin && {
            to: "/employees",
            label: "Employees",
            icon: <FaUserFriends />,
          },
          userInfo?.isPrimaryAdmin && {
            to: "/management",
            label: "Management",
            icon: <FaUserFriends />,
          },
          userInfo?.role === "admin" && {
            to: "/summary",
            label: "Summary",
            icon: <FaClipboardList />,
          },
          // userInfo?.role === "admin" && {
          //   to: "/report",
          //   label: "Report",
          //   icon: <FaChartLine />,
          // },
          userInfo?.role === "admin" && {
            to: "/analysis",
            label: "Analysis",
            icon: <FaChartLine />,
          },
        ]
          .filter(Boolean)
          .map(({ to, label, icon }) => (
            <li className="nav-item" key={to}>
              <Link
                to={to}
                className={`nav-link d-flex align-items-center ${
                  location.pathname === to
                    ? "bg-white text-black"
                    : "text-light"
                }`}
                style={{
                  padding: "10px",
                  transition: "background 0.3s",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#0056b3")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    location.pathname === to ? "#0056b3" : "transparent")
                }
              >
                {icon}
                {!isCollapsed && <span className="ms-2">{label}</span>}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
