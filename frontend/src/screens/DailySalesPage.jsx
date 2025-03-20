import React, { useMemo } from "react";
import { useGetSalesByDateQuery } from "../slices/salesApiSlice";
import { Table, Card, Alert } from "react-bootstrap";

const DailySalesPage = () => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  // Fetch today's sales using the dedicated API call
  const { data: sales, error, isLoading } = useGetSalesByDateQuery(today);

  // Calculate total sales
  const totalSales = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.unitSellingPrice * sale.quantity,
        0
      ) || 0
    );
  }, [sales]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.averageCost * sale.quantity,
        0
      ) || 0
    );
  }, [sales]);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 fw-bold">Today's Sales</h1>

      <Card className="p-4 mb-4">
        <h4 className="text-center">Sales Summary for {today}</h4>
      </Card>

      {/* Show error message if any */}
      {error && <Alert variant="danger">Failed to fetch sales data.</Alert>}

      {/* Loading state */}
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Unit Selling Price</th>
              <th>Total Selling Price</th>
            </tr>
          </thead>
          <tbody>
            {sales?.length > 0 ? (
              sales.map((sale, index) => (
                <tr key={index}>
                  <td>{sale?.createdAt?.split("T")[0] || "Unknown Date"}</td>
                  <td>{sale.name || "Unknown Product"}</td>
                  <td>{sale.quantity}</td>
                  <td>{sale.unitSellingPrice}</td>
                  <td>{sale.quantity * sale.unitSellingPrice}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No sales recorded for today.
                </td>
              </tr>
            )}
            {/* Total row */}
            {sales?.length > 0 && (
              <tr className="fw-bold">
                <td colSpan="4">Total</td>
                <td colSpan="2">{totalSales} ETB</td>
                <td colSpan="1">{totalCost} ETB</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default DailySalesPage;
