import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useLogoutMutation } from "../slices/userApiSlice";
import { logout } from "../slices/authSlice";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

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
    <header>
      <Navbar
        style={{
          background: "transparent",
          color: "#fff",
          width: "100%",
          height: "80px",
          padding: "0 20px",
        }}
      >
        <Container className="d-flex justify-content-end align-items-center h-100">
          <Nav>
            {userInfo ? (
              <NavDropdown
                className="hover:bg-[#677ff6]"
                title={
                  <div
                    className="d-inline-flex align-items-center "
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "white",
                        color: "#1E43FA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ color: "#fff", fontWeight: "500" }}>
                      {userInfo.name}
                    </span>
                  </div>
                }
                id="username"
                align="end"
                style={{
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                <NavDropdown.Item
                  as={Link}
                  to="/profile"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.9rem",
                    color: "#1A1A1A",
                  }}
                >
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={logoutHandler}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.9rem",
                    color: "#1A1A1A",
                  }}
                >
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link
                    style={{
                      color: "#1A1A1A",
                      fontWeight: "500",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(30, 67, 250, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <FaSignInAlt style={{ marginRight: "8px" }} /> Sign In
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link
                    style={{
                      color: "#1A1A1A",
                      fontWeight: "500",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(30, 67, 250, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <FaSignOutAlt style={{ marginRight: "8px" }} /> Sign Up
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
