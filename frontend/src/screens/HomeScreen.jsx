import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import HomeTop from "../components/HomeTop";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import moment from "moment";

const HomePage = () => {
  const today = new Date();
  const startDate = moment(today).subtract(6, "days").format("YYYY-MM-DD");
  const endDate = moment(today).format("YYYY-MM-DD");

  const {
    data: sales,
    isLoading: salesLoading,
    error: salesError,
  } = useGetSalesByDateRangeQuery({
    startDate,
    endDate,
  });

  const {
    data: purchases,
    isLoading: purchasesLoading,
    error: purchasesError,
  } = useGetPurchasesByDateRangeQuery({
    startDate,
    endDate,
  });

  if (salesLoading || purchasesLoading)
    return <div>Loading sales and purchases data...</div>;
  if (salesError || purchasesError) return <div>Error loading data</div>;

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
  console.log(salesByDate, "sale");
  console.log(sales, "ss");
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
        backgroundColor: "#0d6efd",
        borderColor: "#0d6efd",
        borderWidth: 1,
      },
      {
        label: "Total Purchases (ETB)",
        data: purchasesAmounts,
        backgroundColor: "#ffc107",
        borderColor: "#ffc107",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col md={6} className="text-center">
          <img
            src="/image.png"
            alt="Shop Logo"
            style={{
              width: "200px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Col>
        <Col md={6} className="text-center">
          <h1 className="mt-3">Welcome to Our Shop Dashboard</h1>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <HomeTop />
        </Col>

        <Col md={8}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Sales and Purchases for the Last 7 Days</Card.Title>
              <Bar data={chartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
