import React, { useState, useMemo } from "react";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";
import { toast } from "react-toastify";

const AnalysisPage = () => {
  const currentYear = moment().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);

  // Get start and end date for selected month
  const startDate = `${selectedYear}-${selectedMonth
    .toString()
    .padStart(2, "0")}-01`;
  const endDate = moment(startDate).endOf("month").format("YYYY-MM-DD");

  // Fetch sales for the selected month
  const {
    data: monthlySalesData,
    isLoading,
    error,
  } = useGetSalesByDateRangeQuery({ startDate, endDate });

  // Fetch sales for the entire year (separate queries for each month)
  const yearlySalesData = [...Array(12)].map((_, i) => {
    const monthStart = `${selectedYear}-${(i + 1)
      .toString()
      .padStart(2, "0")}-01`;
    const monthEnd = moment(monthStart).endOf("month").format("YYYY-MM-DD");

    return (
      useGetSalesByDateRangeQuery({ startDate: monthStart, endDate: monthEnd })
        .data || []
    );
  });

  // Process Monthly Sales for Top Products
  const processedMonthlySales = useMemo(() => {
    if (!monthlySalesData || !Array.isArray(monthlySalesData)) {
      return { topProducts: [] };
    }

    const salesByProduct = monthlySalesData.reduce((acc, sale) => {
      const productName = sale.name || "Unknown Product";
      const quantity = parseInt(sale.quantity, 10) || 0;

      if (!acc[productName]) {
        acc[productName] = { name: productName, total_sold: 0 };
      }
      acc[productName].total_sold += quantity;

      return acc;
    }, {});

    const topProducts = Object.values(salesByProduct)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5);

    return { topProducts };
  }, [monthlySalesData]);

  // Process Yearly Sales Summary
  const processedYearlySales = useMemo(() => {
    return yearlySalesData.map((salesList, index) => {
      if (!Array.isArray(salesList)) {
        return { month: moment().month(index).format("MMM"), total_sold: 0 };
      }

      const totalSold = salesList.reduce(
        (sum, sale) => sum + (parseInt(sale.quantity, 10) || 0),
        0
      );

      return {
        month: moment().month(index).format("MMM"),
        total_sold: totalSold,
      };
    });
  }, [yearlySalesData]);

  return (
    <Container className="mt-4">
      <div className="bg-white p-4 rounded-3 shadow-sm">
        <h2 className="text-center mb-4" style={{ color: "#1E43FA" }}>
          Shop Sales Analysis
        </h2>

        <Row className="mb-4 g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-medium">Select Year</Form.Label>
              <Form.Control
                as="select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-select"
              >
                {[...Array(5)].map((_, i) => (
                  <option key={i} value={currentYear - i}>
                    {currentYear - i}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-medium">Select Month</Form.Label>
              <Form.Control
                as="select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="form-select"
              >
                {moment.months().map((month, i) => (
                  <option key={i} value={i + 1}>
                    {month}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {isLoading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading sales data...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center">
            Failed to load sales data: {error.message}
          </Alert>
        )}

        {!isLoading &&
          !error &&
          processedMonthlySales.topProducts.length > 0 && (
            <Row className="mt-4">
              <Col md={6}>
                <div className="bg-white p-3 rounded-3 shadow-sm mb-4">
                  <h5 className="text-center mb-3">
                    Top Sold Items (
                    {moment()
                      .month(selectedMonth - 1)
                      .format("MMMM")}
                    )
                  </h5>
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedMonthlySales.topProducts}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="total_sold"
                          fill="#1E43FA"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
            </Row>
          )}

        {/* Yearly Sales Summary */}
        {!isLoading && !error && (
          <Row className="mt-4">
            <Col>
              <div className="bg-white p-3 rounded-3 shadow-sm">
                <h5 className="text-center mb-3">
                  Yearly Sales Summary of ({selectedYear})
                </h5>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedYearlySales}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="total_sold"
                        fill="#28a745"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </div>
    </Container>
  );
};

export default AnalysisPage;
