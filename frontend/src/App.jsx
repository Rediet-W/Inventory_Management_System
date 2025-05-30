import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Sidebar from "./components/SideBar";
import "./utils/fonts.js";

const App = () => {
  return (
    <>
      {/* Header Section */}
      <div
        className="d-flex align-items-center"
        style={{
          position: "relative",
          width: "100%",
          background: "#1E43FA",
          height: "80px",
        }}
      >
        <h3 className="mx-4 text-[#FAC446] text-center">
          የፍኖተ ጽድቅ ሰ/ት/ቤት የንዋየ ቅድሳት መሸጫ ሱቅ
        </h3>

        {/* HEADER */}
        <div style={{ flex: 1 }}>
          <Header />
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />

      {/* SIDEBAR + MAIN CONTENT */}
      <div className="d-flex " style={{ minHeight: "calc(100vh - 80px)" }}>
        <Sidebar />

        {/* Main Content */}
        <Container
          className="my-2"
          style={{
            flex: 1,
            // display: "flex",
            // flexDirection: "column",
            // alignItems: "flex-start",
            // justifyContent: "flex-start",
          }}
        >
          <Outlet />
        </Container>
      </div>
    </>
  );
};

export default App;
