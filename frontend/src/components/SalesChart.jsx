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
  Cell,
} from "recharts";
import {
  useGetAllSalesQuery,
  useGetSalesByDateRangeQuery,
} from "../slices/salesApiSlice";
import moment from "moment";

const COLORS = [
  "#1E43FA",
  "#4CAF50",
  "#FF9800",
  "#9C27B0",
  "#F44336",
  "#607D8B",
];

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
      <Col xs={12} lg={8}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-semibold" style={{ color: "#1A1A1A" }}>
                Sales Trend
              </h5>
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center"
                  style={{
                    borderColor: "#E0E0E0",
                    color: "#1E43FA",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "6px 12px",
                  }}
                >
                  <span className="me-2">
                    {timeRange === "last7days"
                      ? "Last 7 Days"
                      : timeRange === "monthly"
                      ? "This Month"
                      : "This Year"}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="border-0 shadow-sm"
                  style={{ borderRadius: "8px" }}
                >
                  <Dropdown.Item
                    onClick={() => setTimeRange("last7days")}
                    style={{
                      borderRadius: "4px",
                      color: timeRange === "last7days" ? "#1E43FA" : "#1A1A1A",
                      fontWeight: timeRange === "last7days" ? "500" : "400",
                    }}
                  >
                    Last 7 Days
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setTimeRange("monthly")}
                    style={{
                      borderRadius: "4px",
                      color: timeRange === "monthly" ? "#1E43FA" : "#1A1A1A",
                      fontWeight: timeRange === "monthly" ? "500" : "400",
                    }}
                  >
                    This Month
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setTimeRange("yearly")}
                    style={{
                      borderRadius: "4px",
                      color: timeRange === "yearly" ? "#1E43FA" : "#1A1A1A",
                      fontWeight: timeRange === "yearly" ? "500" : "400",
                    }}
                  >
                    This Year
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-5 text-danger">
                Error loading sales data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={salesData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F0F0F0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    radius={[4, 4, 0, 0]}
                    barSize={timeRange === "yearly" ? 20 : 30}
                  >
                    {salesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Best Sold Products */}
      <Col xs={12} lg={4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body className="p-4">
            <h5 className="mb-4 fw-semibold" style={{ color: "#1A1A1A" }}>
              Top Selling Items
            </h5>
            {rangeLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : rangeError ? (
              <div className="text-center py-5 text-danger">
                Error loading sales data
              </div>
            ) : bestSoldProducts.length === 0 ? (
              <div className="text-center py-5 text-muted">No sales data</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {bestSoldProducts.map((product, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center justify-content-between p-3"
                    style={{
                      backgroundColor: "rgba(30, 67, 250, 0.03)",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(30, 67, 250, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(30, 67, 250, 0.03)";
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          backgroundColor: COLORS[index % COLORS.length],
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "12px",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {index + 1}
                      </div>
                      <span style={{ color: "#1A1A1A" }}>{product.name}</span>
                    </div>
                    <span
                      className="fw-semibold"
                      style={{ color: COLORS[index % COLORS.length] }}
                    >
                      {product.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SalesOverview;
