import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Row,
  Col,
  Spinner,
  Card,
  Badge,
  Alert,
} from "react-bootstrap";
import { useGetAllPurchasesQuery } from "../slices/purchaseApiSlice";
import { useGetAllTransfersQuery } from "../slices/transferApiSlice";
import { useGetProductByBatchNumberQuery } from "../slices/productApiSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StockCardPage = () => {
  const { data: purchases, isLoading: isLoadingPurchases } =
    useGetAllPurchasesQuery();
  const { data: transfers, isLoading: isLoadingTransfers } =
    useGetAllTransfersQuery();
  const [selectedBatch, setSelectedBatch] = useState("");
  const [stockMovements, setStockMovements] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);
  const { data: product, isLoading: isLoadingProduct } =
    useGetProductByBatchNumberQuery(selectedBatch, {
      skip: !selectedBatch,
    });

  useEffect(() => {
    if (purchases && transfers) {
      const purchaseBatches = purchases.map((p) => p.batchNumber);
      const transferBatches = transfers.map((t) => t.batchNumber);
      const uniqueBatches = [
        ...new Set([...purchaseBatches, ...transferBatches]),
      ];
      setBatchNumbers(uniqueBatches);
    }
  }, [purchases, transfers]);

  useEffect(() => {
    if (selectedBatch && purchases && transfers) {
      const purchaseRecords = purchases
        .filter((p) => p.batchNumber === selectedBatch)
        .map((p) => ({
          date: p.createdAt,
          ref: p.reference,
          inQty: Number(p.quantity) || 0,
          inUnitCost: Number(p.unitCost) || 0,
          inTotalCost: Number(p.totalCost) || 0,
          outQty: 0,
          outTotalCost: 0,
        }));

      const transferRecords = transfers
        .filter((t) => t.batchNumber === selectedBatch)
        .map((t) => ({
          date: t.createdAt,
          ref: t.reference,
          inQty: 0,
          inUnitCost: 0,
          inTotalCost: 0,
          outQty: Number(t.quantity) || 0,
          outTotalCost: (Number(t.quantity) || 0) * (product?.averageCost || 0),
        }));

      const movements = [...purchaseRecords, ...transferRecords].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      let balance = 0;
      const updatedMovements = movements.map((record) => {
        balance += record.inQty - record.outQty;
        return { ...record, balance };
      });

      setStockMovements(updatedMovements);
    }
  }, [selectedBatch, purchases, transfers, product]);

  if (isLoadingPurchases || isLoadingTransfers || isLoadingProduct) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">Stock Card</h3>

          <Row className="mb-4 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Batch Number</Form.Label>
                <Form.Select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  size="sm"
                >
                  <option value="">Select Batch</option>
                  {batchNumbers.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={product?.name || ""}
                  disabled
                  size="sm"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Unit of Measurement</Form.Label>
                <Form.Control
                  type="text"
                  value={product?.unitOfMeasurement || ""}
                  disabled
                  size="sm"
                />
              </Form.Group>
            </Col>
          </Row>

          {selectedBatch ? (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th rowSpan="2">Date</th>
                    <th rowSpan="2">Reference</th>
                    <th colSpan="3" className="text-center">
                      In
                    </th>
                    <th colSpan="2" className="text-center">
                      Out
                    </th>
                    <th rowSpan="2">Balance</th>
                  </tr>
                  <tr>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Qty</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.length > 0 ? (
                    stockMovements.map((movement, index) => (
                      <tr key={index}>
                        <td>{new Date(movement.date).toLocaleDateString()}</td>
                        <td>{movement.ref}</td>
                        <td>{movement.inQty || "-"}</td>
                        <td>
                          {movement.inUnitCost > 0
                            ? movement.inUnitCost.toFixed(2)
                            : "-"}
                        </td>
                        <td>
                          {movement.inTotalCost > 0
                            ? movement.inTotalCost.toFixed(2)
                            : "-"}
                        </td>
                        <td>{movement.outQty || "-"}</td>
                        <td>
                          {movement.outTotalCost > 0
                            ? movement.outTotalCost.toFixed(2)
                            : "-"}
                        </td>
                        <td
                          className={
                            movement.balance <= (product?.reorderLevel || 0)
                              ? "text-danger fw-bold"
                              : ""
                          }
                        >
                          {movement.balance}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No stock movement found for selected batch
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info" className="text-center">
              Please select a batch number to view stock movements
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockCardPage;
