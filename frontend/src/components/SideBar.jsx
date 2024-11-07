import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaStore,
  FaUserFriends,
  FaClipboardList,
  FaShoppingCart,
  FaBoxOpen,
  FaChartLine,
  FaBars,
} from "react-icons/fa"; // Updated icons to match functionality

const Sidebar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!userInfo) {
    return null;
  }

  return (
    <div
      className={`d-flex flex-column sidebar ${
        isCollapsed ? "collapsed-sidebar" : ""
      }`}
      style={{
        width: isCollapsed ? "80px" : "250px",
        height: "100vh",
        background: "linear-gradient(180deg, #007bff, #ffcc00)",
        position: "sticky",
        top: "0",
        left: 0,
        transition: "width 0.3s",
        zIndex: 1000,
      }}
    >
      {/* Toggle button for sidebar */}
      <button
        className="btn btn-light mb-3"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          color: "#fff",
          fontSize: "20px", // Make it bigger for better visibility
          background: "transparent", // Transparent background
        }}
      >
        <FaBars />
      </button>

      {/* Dashboard Link */}
      <Link
        to="/"
        className="d-flex align-items-center mb-3 text-light text-decoration-none"
        style={{
          color: "#fff",
          padding: "10px",
        }}
      >
        <FaHome className="me-2" />
        {!isCollapsed && <span className="fs-4">Dashboard</span>}
      </Link>
      <hr style={{ borderColor: "#fff" }} />

      <ul className="nav nav-pills flex-column mb-auto">
        {/* SuperAdmin-specific links */}
        {userInfo?.role === "superAdmin" && (
          <>
            <li className="nav-item">
              <Link
                to="/report"
                className="nav-link text-light"
                style={{
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaChartLine className="me-2 icon-blue" />
                {!isCollapsed && <span>Report</span>}
              </Link>
            </li>
          </>
        )}

        {/* User and Admin Links */}
        {userInfo?.role !== "superAdmin" && (
          <>
            {/* Requested page */}
            <li className="nav-item">
              <Link
                to="/requested"
                className="nav-link text-light"
                style={{
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaClipboardList className="me-2 icon-blue" />
                {!isCollapsed && <span>Requested</span>}
              </Link>
            </li>

            {/* Sales page */}
            <li className="nav-item">
              <Link
                to="/sales"
                className="nav-link text-light"
                style={{
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaShoppingCart className="me-2 icon-yellow" />
                {!isCollapsed && <span>Sales</span>}
              </Link>
            </li>

            {/* Shop page */}
            <li className="nav-item">
              <Link
                to="/shop"
                className="nav-link text-light"
                style={{
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaStore className="me-2 icon-blue" />
                {!isCollapsed && <span>Shop</span>}
              </Link>
            </li>

            {/* Admin-specific links */}
            {userInfo?.role === "admin" && (
              <>
                <li className="nav-item">
                  <Link
                    to="/add-products"
                    className="nav-link text-light"
                    style={{
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaBoxOpen className="me-2 icon-blue" />
                    {!isCollapsed && <span>Add Products</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/store"
                    className="nav-link text-light"
                    style={{
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaStore className="me-2 icon-yellow" />
                    {!isCollapsed && <span>Store</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/employees"
                    className="nav-link text-light"
                    style={{
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaUserFriends className="me-2 icon-yellow" />
                    {!isCollapsed && <span>Employees</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/summary"
                    className="nav-link text-light"
                    style={{
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaClipboardList className="me-2 icon-blue" />
                    {!isCollapsed && <span>Summary</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/report"
                    className="nav-link text-light"
                    style={{
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaChartLine className="me-2 icon-yellow" />
                    {!isCollapsed && <span>Report</span>}
                  </Link>
                </li>
              </>
            )}
          </>
        )}
      </ul>
      <hr style={{ borderColor: "#fff" }} />
    </div>
  );
};

export default Sidebar;
