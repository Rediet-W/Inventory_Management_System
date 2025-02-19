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

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const today = new Date();
  const startDate = moment(today).subtract(6, "days").format("YYYY-MM-DD");
  const endDate = moment(today).format("YYYY-MM-DD");

  const {
    data: sales,
    isLoading: salesLoading,
    error: salesError,
  } = useGetSalesByDateRangeQuery({ startDate, endDate });

  const {
    data: purchases,
    isLoading: purchasesLoading,
    error: purchasesError,
  } = useGetPurchasesByDateRangeQuery({ startDate, endDate });

  if (salesLoading || purchasesLoading)
    return (
      <div className="text-center mt-5">
        Loading sales and purchases data...
      </div>
    );
  if (salesError || purchasesError)
    return (
      <div className="text-center mt-5 text-danger">Error loading data</div>
    );

  const last7Days = Array.from({ length: 7 }, (_, i) =>
    moment(today).subtract(i, "days").format("YYYY-MM-DD")
  ).reverse();

  const salesByDate = sales.reduce((acc, sale) => {
    const saleDate = moment(sale.sale_date).format("YYYY-MM-DD");
    acc[saleDate] = acc[saleDate]
      ? acc[saleDate] + sale.selling_price * sale.quantity_sold
      : sale.selling_price * sale.quantity_sold;
    return acc;
  }, {});

  const purchasesByDate = purchases.reduce((acc, purchase) => {
    const purchaseDate = moment(purchase.purchase_date).format("YYYY-MM-DD");
    acc[purchaseDate] = acc[purchaseDate]
      ? acc[purchaseDate] + purchase.buying_price * purchase.quantity
      : purchase.buying_price * purchase.quantity;
    return acc;
  }, {});

  const salesAmounts = last7Days.map((date) => salesByDate[date] || 0);
  const purchasesAmounts = last7Days.map((date) => purchasesByDate[date] || 0);

  const chartData = {
    labels: last7Days,
    datasets: [
      {
        label: "Total Sales (ETB)",
        data: salesAmounts,
        backgroundColor: "rgba(13, 110, 253, 0.5)",
        borderColor: "rgba(13, 110, 253, 1)",
        borderWidth: 2,
      },
      {
        label: "Total Purchases (ETB)",
        data: purchasesAmounts,
        backgroundColor: "rgba(255, 193, 7, 0.5)",
        borderColor: "rgba(255, 193, 7, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center text-center">
        <Col md={6}>
          <img
            src="/logo.png"
            alt="Shop Logo"
            style={{
              width: "150px",
              height: "auto",
              borderRadius: "50%",
              border: "3px solid #0d6efd",
            }}
          />
        </Col>
        <Col md={6}>
          <h1 className="mt-3 fw-bold">Welcome </h1>
        </Col>
      </Row>

      {userInfo?.role !== "superadmin" && (
        <>
          <Row className="mb-4">
            {" "}
            <HomeTop />
          </Row>
          <Row className="mb-4">
            <Col md={5}>{/* <SalesCalendar />{" "} */}</Col>
            <Col md={7}>
              <Card className="text-center shadow-lg border-0">
                <Card.Body>
                  <Card.Title className="fw-bold">
                    Sales and Purchases for the Last 7 Days
                  </Card.Title>
                  <Bar data={chartData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default HomePage;
