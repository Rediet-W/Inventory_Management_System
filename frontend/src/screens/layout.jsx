import React, { useState } from "react";
import { Container } from "react-bootstrap";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className={`sidebar-container ${
          isSidebarOpen ? "sidebar-open" : ""
        } d-none d-md-block`}
      >
        <Sidebar />
      </div>

      {/* Overlay Sidebar for smaller screens */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay d-block d-md-none"
          onClick={() => setIsSidebarOpen(false)} // Close overlay on click outside
        >
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <Container className="mt-3">{children}</Container>
      </div>
    </div>
  );
};

export default Layout;
