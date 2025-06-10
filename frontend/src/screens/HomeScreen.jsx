import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import HomeTop from "../components/HomeTop";
import { useSelector } from "react-redux";
import SalesOverview from "../components/SalesChart";

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const today = new Date();

  return (
    <Container fluid className="px-4 py-3">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="mb-0 fw-bold" style={{ color: "#1A1A1A" }}>
            Welcome back, {userInfo?.name}!
          </h1>
          <p className="text-muted mb-0">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12}>
          <HomeTop />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <SalesOverview />
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
