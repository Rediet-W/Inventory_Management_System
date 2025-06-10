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
    useGetProductByBatchNumberQuery(selectedBatch, { skip: !selectedBatch });

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
          ref: p.reference || "Purchase",
          inQty: Number(p.quantity) || 0,
          inUnitCost: Number(p.unitCost) || 0,
          inTotalCost: Number(p.totalCost) || 0,
          outQty: 0,
          outUnitCost: 0,
          outTotalCost: 0,
        }));

      const transferRecords = transfers
        .filter((t) => t.batchNumber === selectedBatch)
        .map((t) => ({
          date: t.createdAt,
          ref: t.reference || "Transfer",
          inQty: 0,
          inUnitCost: 0,
          inTotalCost: 0,
          outQty: Number(t.quantity) || 0,
          outUnitCost: product?.averageCost || 0,
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

  const isLoading =
    isLoadingPurchases || isLoadingTransfers || isLoadingProduct;

  return (
    <div className="container-fluid p-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0" style={{ color: "#1E43FA" }}>
              Stock Card
            </h3>
            <Badge bg="light" text="dark" className="fs-6">
              {selectedBatch ? `Batch: ${selectedBatch}` : "Select a batch"}
            </Badge>
          </div>

          <Row className="mb-4 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Batch Number</Form.Label>
                <Form.Select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Batch</option>
                  {batchNumbers.length > 0 ? (
                    batchNumbers.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))
                  ) : (
                    <option disabled>No batches available</option>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={product?.name || ""}
                  disabled
                  className="form-control"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Unit of Measure</Form.Label>
                <Form.Control
                  type="text"
                  value={product?.unitOfMeasurement || ""}
                  disabled
                  className="form-control"
                />
              </Form.Group>
            </Col>
          </Row>

          {isLoading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : selectedBatch ? (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th rowSpan="2">Date</th>
                    <th rowSpan="2">Reference</th>
                    <th colSpan="3" className="text-center">
                      In
                    </th>
                    <th colSpan="3" className="text-center">
                      Out
                    </th>
                    <th rowSpan="2">Balance</th>
                  </tr>
                  <tr>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.length > 0 ? (
                    stockMovements.map((movement, index) => {
                      const hasNegativeQty =
                        movement.inQty < 0 ||
                        movement.outQty < 0 ||
                        movement.balance < 0;

                      return (
                        <tr
                          key={index}
                          className={hasNegativeQty ? "table-warning" : ""}
                        >
                          <td>
                            {new Date(movement.date).toLocaleDateString()}
                          </td>
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
                            {movement.outUnitCost > 0
                              ? movement.outUnitCost
                              : "-"}
                          </td>
                          <td>
                            {movement.outTotalCost > 0
                              ? movement.outTotalCost
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
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-muted">
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default StockCardPage;
