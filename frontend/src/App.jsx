import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Sidebar from "./components/SideBar";
import Layout from "./screens/layout";
import logo from "/logo.png";

const App = () => {
  return (
    <>
      {/* TOP LOGO + HEADER */}
      <div
        className="d-flex align-items-center"
        style={{
          position: "relative",
          width: "100%",
          background: "#0076f5",
          // padding: "10px 20px",
          height: "80px",
        }}
      >
        {/* LOGO */}
        <img
          src={logo}
          style={{
            width: "80px",
            height: "80px",
            objectFit: "contain",
            marginRight: "10px",
          }}
        />

        {/* HEADER */}
        <div style={{ flex: 1 }}>
          <Header />
        </div>
      </div>

      <ToastContainer />

      {/* SIDEBAR + MAIN CONTENT */}
      <div className="d-flex">
        <Sidebar />

        <Container className="my-2" style={{ flex: 1 }}>
          <Outlet />
        </Container>
      </div>
    </>
  );
};

export default App;
