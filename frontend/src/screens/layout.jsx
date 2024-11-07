import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaBars,
  FaHome,
  FaStore,
  FaUserFriends,
  FaClipboardList,
  FaShoppingCart,
  FaBoxOpen,
  FaChartLine,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useLogoutMutation } from "../slices/userApiSlice";
import { logout } from "../slices/authSlice";

const Layout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  // Handle sidebar collapse based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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
    <div className="d-flex">
      {/* Sidebar */}
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
          overflowY: "auto",
        }}
      >
        {/* Toggle button for sidebar */}
        <button
          className="btn btn-light mb-3"
          onClick={toggleSidebar}
          style={{
            color: "#fff",
            fontSize: "20px",
            background: "transparent",
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
                </>
              )}
            </>
          )}
        </ul>
        <hr style={{ borderColor: "#fff" }} />
      </div>

      {/* Header */}
      <div style={{ width: "100%" }}>
        <Navbar
          expand="lg"
          collapseOnSelect
          style={{
            background: "linear-gradient(to right, #007bff, #ffcc00)",
            color: "#fff",
          }}
        >
          <Container fluid>
            {/* Sidebar toggle button in the header */}
            <button
              className="btn btn-light me-3"
              onClick={toggleSidebar}
              style={{
                fontSize: "20px",
                background: "transparent",
                color: "#fff",
              }}
            >
              <FaBars />
            </button>
            <LinkContainer to="/">
              <Navbar.Brand style={{ color: "#fff" }}>
                Shop Manager
              </Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="justify-content-end"
            >
              <Nav>
                {userInfo ? (
                  <NavDropdown
                    title={
                      <span style={{ color: "#fff" }}>{userInfo.name}</span>
                    }
                    id="username"
                  >
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <>
                    <LinkContainer to="/login">
                      <Nav.Link>
                        <span>
                          <FaSignInAlt style={{ color: "#fff" }} /> Sign In
                        </span>
                      </Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/register">
                      <Nav.Link>
                        <span>
                          <FaSignOutAlt style={{ color: "#fff" }} /> Sign Up
                        </span>
                      </Nav.Link>
                    </LinkContainer>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    </div>
  );
};

export default Layout;
