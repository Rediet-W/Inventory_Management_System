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
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

const Sidebar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!userInfo) {
    return null;
  }

  return (
    <div
      className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}
      style={{
        width: isCollapsed ? "80px" : "250px",
        height: "100vh",
        background: "linear-gradient(180deg, #007bff, #ffcc00)",
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
          background: "#007bff",
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
        {/* Dashboard */}
        <li className="nav-item">
          <Link
            to="/"
            className="nav-link text-light d-flex align-items-center"
            style={{ padding: "10px" }}
          >
            <FaHome className="me-2" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>
        <hr style={{ borderColor: "#fff" }} />

        {/* SuperAdmin-specific links */}
        {userInfo?.role === "superadmin" && (
          <li className="nav-item">
            <Link
              to="/report"
              className="nav-link text-light d-flex align-items-center"
              style={{ padding: "10px" }}
            >
              <FaChartLine className="me-2" />
              {!isCollapsed && <span>Report</span>}
            </Link>
          </li>
        )}

        {/* User and Admin Links */}
        {userInfo?.role !== "superadmin" && (
          <>
            {/* Requested */}
            <li className="nav-item">
              <Link
                to="/requested"
                className="nav-link text-light d-flex align-items-center"
                style={{ padding: "10px" }}
              >
                <FaClipboardList className="me-2" />
                {!isCollapsed && <span>Requested</span>}
              </Link>
            </li>

            {/* Sales */}
            <li className="nav-item">
              <Link
                to="/sales"
                className="nav-link text-light d-flex align-items-center"
                style={{ padding: "10px" }}
              >
                <FaShoppingCart className="me-2" />
                {!isCollapsed && <span>Sales</span>}
              </Link>
            </li>

            {/* Shop */}
            <li className="nav-item">
              <Link
                to="/shop"
                className="nav-link text-light d-flex align-items-center"
                style={{ padding: "10px" }}
              >
                <FaStore className="me-2" />
                {!isCollapsed && <span>Shop</span>}
              </Link>
            </li>

            {/* Admin-specific Links */}
            {userInfo?.role === "admin" && (
              <>
                <li className="nav-item">
                  <Link
                    to="/add-products"
                    className="nav-link text-light d-flex align-items-center"
                    style={{ padding: "10px" }}
                  >
                    <FaBoxOpen className="me-2" />
                    {!isCollapsed && <span>Add Products</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/store"
                    className="nav-link text-light d-flex align-items-center"
                    style={{ padding: "10px" }}
                  >
                    <FaStore className="me-2" />
                    {!isCollapsed && <span>Store</span>}
                  </Link>
                </li>
                {userInfo?.isPrimaryAdmin && (
                  <li className="nav-item">
                    <Link
                      to="/employees"
                      className="nav-link text-light d-flex align-items-center"
                      style={{ padding: "10px" }}
                    >
                      <FaUserFriends className="me-2" />
                      {!isCollapsed && <span>Employees</span>}
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <Link
                    to="/summary"
                    className="nav-link text-light d-flex align-items-center"
                    style={{ padding: "10px" }}
                  >
                    <FaClipboardList className="me-2" />
                    {!isCollapsed && <span>Summary</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/report"
                    className="nav-link text-light d-flex align-items-center"
                    style={{ padding: "10px" }}
                  >
                    <FaChartLine className="me-2" />
                    {!isCollapsed && <span>Report</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/analysis"
                    className="nav-link text-light d-flex align-items-center"
                    style={{ padding: "10px" }}
                  >
                    <FaChartLine className="me-2" />
                    {!isCollapsed && <span>Analysis</span>}
                  </Link>
                </li>
              </>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
