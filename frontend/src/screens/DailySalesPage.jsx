import React, { useMemo, useEffect } from "react";
import { useGetSalesByDateQuery } from "../slices/salesApiSlice";
import { Table, Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DailySalesPage = () => {
  const today = new Date().toISOString().split("T")[0];
  const { data: sales, error, isLoading } = useGetSalesByDateQuery(today);

  const totalSales = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.unitSellingPrice * sale.quantity,
        0
      ) || 0
    );
  }, [sales]);

  const totalCost = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.averageCost * sale.quantity,
        0
      ) || 0
    );
  }, [sales]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch sales data", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  }, [error]);

  return (
    <div className="container-fluid p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h1 className="card-title text-center mb-4">Today's Sales</h1>

          <Card className="border-0 bg-light mb-4">
            <Card.Body className="text-center">
              <h4>Sales Summary for {today}</h4>
              <div className="d-flex justify-content-center gap-5 mt-3">
                <div className="text-center">
                  <h6 className="text-muted">Total Sales</h6>
                  <h4 className="text-primary">{totalSales.toFixed(2)} ETB</h4>
                </div>
                {/* <div className="text-center">
                  <h6 className="text-muted">Total Cost</h6>
                  <h4 className="text-success">{totalCost.toFixed(2)} ETB</h4>
                </div> */}
              </div>
            </Card.Body>
          </Card>

          {isLoading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.length > 0 ? (
                    sales.map((sale, index) => (
                      <tr key={index}>
                        <td>{sale?.createdAt?.split("T")[0] || "N/A"}</td>
                        <td>{sale.name || "Unknown"}</td>
                        <td>{sale.quantity}</td>
                        <td>{Number(sale.unitSellingPrice).toFixed(2)}</td>
                        <td>
                          {(sale.quantity * sale.unitSellingPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No sales recorded for today
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySalesPage;
