import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Sidebar from "./components/SideBar";
import Layout from "./screens/layout";

const App = () => {
  return (
    <>
      <Header />

      {/* <Layout /> */}
      <ToastContainer />
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
