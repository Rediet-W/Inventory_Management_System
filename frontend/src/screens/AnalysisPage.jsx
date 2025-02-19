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

const AnalysisPage = () => {
  const currentYear = moment().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);

  const startDate = `${selectedYear}-${selectedMonth
    .toString()
    .padStart(2, "0")}-01`;
  const endDate = moment(startDate).endOf("month").format("YYYY-MM-DD");

  const {
    data: monthlySalesData,
    isLoading: isLoadingMonthly,
    error: errorMonthly,
  } = useGetSalesByDateRangeQuery({ startDate, endDate });

  const monthlySalesQueries = Array.from({ length: 12 }, (_, i) => {
    const monthStart = `${selectedYear}-${(i + 1)
      .toString()
      .padStart(2, "0")}-01`;
    const monthEnd = moment(monthStart).endOf("month").format("YYYY-MM-DD");

    return useGetSalesByDateRangeQuery({
      startDate: monthStart,
      endDate: monthEnd,
    });
  });

  const processedMonthlySales = useMemo(() => {
    const salesList = Array.isArray(monthlySalesData)
      ? monthlySalesData
      : monthlySalesData?.data;

    if (!salesList || salesList.length === 0) {
      return { topProducts: [] };
    }

    const salesByProduct = salesList.reduce((acc, sale) => {
      const productName = sale.product_name || "Unknown Product";
      const quantity = parseInt(sale.quantity_sold, 10) || 0;

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

  const processedYearlySales = useMemo(() => {
    return monthlySalesQueries.map((query, index) => {
      const salesList = Array.isArray(query.data)
        ? query.data
        : query.data?.data;

      const totalSold = salesList
        ? salesList.reduce(
            (sum, sale) => sum + (parseInt(sale.quantity_sold, 10) || 0),
            0
          )
        : 0;

      return {
        month: moment().month(index).format("MMM"),
        total_sold: totalSold,
      };
    });
  }, [monthlySalesQueries]);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4"> Shop Sales Analysis</h2>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Year</Form.Label>
            <Form.Control
              as="select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
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
            <Form.Label>Select Month</Form.Label>
            <Form.Control
              as="select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
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

      {(isLoadingMonthly || monthlySalesQueries.some((q) => q.isLoading)) && (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading sales data...</p>
        </div>
      )}

      {errorMonthly && (
        <Alert variant="danger" className="text-center">
          Failed to load monthly sales data: {errorMonthly.message}
        </Alert>
      )}

      {monthlySalesQueries.some((q) => q.error) && (
        <Alert variant="danger" className="text-center">
          Failed to load yearly sales data.
        </Alert>
      )}

      {/* Top Sold Items (Monthly) */}
      {!isLoadingMonthly &&
        !errorMonthly &&
        processedMonthlySales.topProducts.length > 0 && (
          <Row className="mt-4">
            <Col md={6}>
              <h5 className="text-center">
                📊 Top Sold Items (
                {moment()
                  .month(selectedMonth - 1)
                  .format("MMMM")}
                )
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedMonthlySales.topProducts}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_sold" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        )}

      {/* Yearly Sales Summary */}
      {!monthlySalesQueries.some((q) => q.isLoading) &&
        !monthlySalesQueries.some((q) => q.error) && (
          <Row className="mt-4">
            <Col>
              <h5 className="text-center">
                Yearly Sales Summary ({selectedYear})
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedYearlySales}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_sold" fill="#28a745" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        )}
    </Container>
  );
};

export default AnalysisPage;
