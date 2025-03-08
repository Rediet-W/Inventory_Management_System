import React, { useState } from "react";
import { Card, Dropdown, Row, Col } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  useGetAllSalesQuery,
  useGetSalesByDateRangeQuery,
} from "../slices/salesApiSlice";
import moment from "moment";

const SalesOverview = () => {
  const [timeRange, setTimeRange] = useState("last7days");

  // Fetch all sales for chart
  const { data: sales, isLoading, error } = useGetAllSalesQuery();

  // Get sales data for best sold products (last 1 month)
  const startDate = moment().subtract(1, "months").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");
  const {
    data: salesByRange,
    isLoading: rangeLoading,
    error: rangeError,
  } = useGetSalesByDateRangeQuery({ startDate, endDate });

  // Filter sales data for chart
  const getFilteredData = () => {
    if (!sales || sales.length === 0) return [];

    const currentDate = moment();
    let filteredData = [];

    if (timeRange === "last7days") {
      const last7Days = [...Array(7)]
        .map((_, i) =>
          currentDate.clone().subtract(i, "days").format("YYYY-MM-DD")
        )
        .reverse();

      filteredData = last7Days.map((date) => ({
        name: moment(date).format("ddd"),
        sales: sales
          .filter(
            (sale) => moment(sale.createdAt).format("YYYY-MM-DD") === date
          )
          .reduce((sum, sale) => sum + parseFloat(sale.totalSellingPrice), 0),
      }));
    } else if (timeRange === "monthly") {
      const startOfMonth = currentDate.startOf("month");
      const weeks = [...Array(5)].map((_, i) =>
        startOfMonth.clone().add(i, "weeks").format("YYYY-MM-DD")
      );

      filteredData = weeks.map((week, i) => ({
        name: `Week ${i + 1}`,
        sales: sales
          .filter((sale) =>
            moment(sale.createdAt).isBetween(
              moment(week).startOf("week"),
              moment(week).endOf("week"),
              null,
              "[]"
            )
          )
          .reduce((sum, sale) => sum + parseFloat(sale.totalSellingPrice), 0),
      }));
    } else if (timeRange === "yearly") {
      filteredData = [...Array(12)].map((_, i) => ({
        name: moment().month(i).format("MMM"),
        sales: sales
          .filter((sale) => moment(sale.createdAt).month() === i)
          .reduce((sum, sale) => sum + parseFloat(sale.totalSellingPrice), 0),
      }));
    }

    return filteredData;
  };

  const salesData = getFilteredData();

  // Get top 6 best-sold products
  const getBestSoldProducts = () => {
    if (!salesByRange || salesByRange.length === 0) return [];

    // Aggregate sales by product name
    const productSales = salesByRange.reduce((acc, sale) => {
      const productName = sale.name;
      acc[productName] = (acc[productName] || 0) + sale.quantity;
      return acc;
    }, {});

    // Convert to array and sort by highest quantity sold
    return Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity) // Sort descending
      .slice(0, 6); // Take top 6
  };

  const bestSoldProducts = getBestSoldProducts();

  return (
    <Row className="g-4">
      {/* Sales Chart */}
      <Col xs={12} md={8}>
        <Card className="shadow-sm p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="text-primary">Revenue </h5>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" size="sm">
                {timeRange === "last7days"
                  ? "Last 7 Days"
                  : timeRange === "monthly"
                  ? "This Month"
                  : "This Year"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setTimeRange("last7days")}>
                  Last 7 Days
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setTimeRange("monthly")}>
                  This Month
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setTimeRange("yearly")}>
                  This Year
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-danger">Error loading sales data</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </Col>

      {/* Best Sold Products */}
      <Col xs={12} md={4}>
        <Card className="shadow-sm p-3">
          <h5 className="text-primary">Best Sold Products</h5>
          {rangeLoading ? (
            <div className="text-center">Loading...</div>
          ) : rangeError ? (
            <div className="text-danger">Error loading sales data</div>
          ) : bestSoldProducts.length === 0 ? (
            <div className="text-center text-muted">No sales data</div>
          ) : (
            bestSoldProducts.map((product, index) => (
              <div key={index}>
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="fw-bold">{index + 1}.</span>
                  <span>{product.name}</span>
                  <span className="fw-bold">{product.quantity}</span>
                </div>
                {index !== bestSoldProducts.length - 1 && (
                  <hr className="my-1" />
                )}
              </div>
            ))
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default SalesOverview;
