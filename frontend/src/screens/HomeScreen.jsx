import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import HomeTop from "../components/HomeTop";
import { useSelector } from "react-redux";
import SalesChart from "../components/SalesChart";

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const today = new Date();

  return (
    <Container className="mt-3 w-full">
      <Row className="align-items-center ">
        <h1 className="mt-3 fw-bold">Welcome {userInfo.name},</h1>
      </Row>

      <>
        <Row className="mb-4">
          {" "}
          <HomeTop />
          <SalesChart />
        </Row>
      </>
    </Container>
  );
};

export default HomePage;
