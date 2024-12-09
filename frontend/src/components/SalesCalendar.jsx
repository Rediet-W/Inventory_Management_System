import React, { useState, useEffect } from "react";
import { Card, Spinner, ListGroup } from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Default styles
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import moment from "moment";

const SalesCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState(moment().startOf("month")); // Default to current month
  const [monthlyTopSales, setMonthlyTopSales] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const startDate = selectedMonth.startOf("month").format("YYYY-MM-DD");
  const endDate = selectedMonth.endOf("month").format("YYYY-MM-DD");

  const {
    data: sales,
    isLoading,
    error,
  } = useGetSalesByDateRangeQuery({
    startDate,
    endDate,
  });

  useEffect(() => {
    if (sales) {
      const salesByProduct = sales.reduce((acc, sale) => {
        acc[sale.product_id] = acc[sale.product_id] || {
          product_name: sale.product_name,
          total_quantity_sold: 0,
        };
        acc[sale.product_id].total_quantity_sold += sale.quantity_sold;
        return acc;
      }, {});

      const topSales = Object.values(salesByProduct)
        .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
        .slice(0, 3);

      setMonthlyTopSales(topSales);
      setIsFetching(false);
    }
  }, [sales]);

  const handleMonthChange = ({ activeStartDate }) => {
    setIsFetching(true);
    setSelectedMonth(moment(activeStartDate));
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Card.Title className="text-center fw-bold">Sales Calendar</Card.Title>

        {/* Loading Spinner */}
        {(isLoading || isFetching) && (
          <div className="text-center my-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading sales data...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-center text-danger">
            Error loading sales data: {error.message}
          </p>
        )}
        <div className="flex flex-col md:flex-row">
          {/* Calendar for Month Selection */}
          <div className="flex justify-content-center my-3">
            <Calendar
              view="year" // Show months in the year
              tileDisabled={({ date }) => date > new Date()} // Disable future months
              onActiveStartDateChange={handleMonthChange}
              defaultView="year"
              className="compact-calendar"
            />
          </div>

          {!isLoading && !error && (
            <div className="mt-4">
              <h5 className="text-center">
                Top Sold Items for {selectedMonth.format("MMMM YYYY")}
              </h5>
              {monthlyTopSales.length > 0 ? (
                <ListGroup className="mt-1">
                  {monthlyTopSales.map((item, idx) => (
                    <ListGroup.Item
                      key={idx}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>{item.product_name}</span>
                      <span className="badge bg-primary rounded-pill">
                        {item.total_quantity_sold} sold
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center text-muted mt-3">
                  No sales data available for this month.
                </p>
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SalesCalendar;
