import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import HomeTop from "../components/HomeTop";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import moment from "moment";
import { useSelector } from "react-redux";
import SalesCalendar from "../components/SalesCalendar";
import SalesChart from "../components/SalesChart";
import BestSoldProducts from "../components/BestSoldProducts";

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const today = new Date();
  const startDate = moment(today).subtract(6, "days").format("YYYY-MM-DD");
  const endDate = moment(today).format("YYYY-MM-DD");

  return (
    <Container className="mt-5">
      <Row className="align-items-center ">
        <h1 className="mt-3 fw-bold">Welcome {userInfo.name},</h1>
      </Row>

      {userInfo?.role !== "superadmin" && (
        <>
          <Row className="mb-4">
            {" "}
            <HomeTop />
            <SalesChart />
          </Row>
        </>
      )}
    </Container>
  );
};

export default HomePage;
