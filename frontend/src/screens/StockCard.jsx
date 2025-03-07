import React, { useState, useEffect } from "react";
import { Table, Form, Row, Col } from "react-bootstrap";
import { useGetAllPurchasesQuery } from "../slices/purchaseApiSlice";
import { useGetAllTransfersQuery } from "../slices/transferApiSlice";
import { useGetProductByBatchNumberQuery } from "../slices/productApiSlice";

const StockCardPage = () => {
  // Fetch Purchases & Transfers
  const { data: purchases, isLoading: isLoadingPurchases } =
    useGetAllPurchasesQuery();
  const { data: transfers, isLoading: isLoadingTransfers } =
    useGetAllTransfersQuery();

  const [selectedBatch, setSelectedBatch] = useState("");
  const [stockMovements, setStockMovements] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);

  // Fetch product details when batch number is selected
  const { data: product, isLoading: isLoadingProduct } =
    useGetProductByBatchNumberQuery(selectedBatch, {
      skip: !selectedBatch, // Skip API call if batch is not selected
    });

  // **Fetch Unique Batch Numbers**
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

  // **Update Stock Movements when Batch is Selected**
  useEffect(() => {
    if (selectedBatch && purchases && transfers) {
      // Get all purchases & transfers for the selected batch
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

      // Combine & Sort by Date
      const movements = [...purchaseRecords, ...transferRecords].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Compute Balance
      let balance = 0;
      const updatedMovements = movements.map((record) => {
        balance += record.inQty - record.outQty;
        return { ...record, balance };
      });

      setStockMovements(updatedMovements);
    }
  }, [selectedBatch, purchases, transfers, product]);

  if (isLoadingPurchases || isLoadingTransfers || isLoadingProduct)
    return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <h3 className="text-center">Stock Card</h3>

      {/* Batch Number Dropdown */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Select Batch Number</Form.Label>
            <Form.Select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
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
            <Form.Label>Product Name</Form.Label>
            <Form.Control type="text" value={product?.name || ""} disabled />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Unit of Measurement</Form.Label>
            <Form.Control
              type="text"
              value={product?.unitOfMeasurement || ""}
              disabled
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Stock Card Table with Grouped Headers */}
      <Table striped bordered hover responsive className="table-sm mt-3">
        <thead>
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
                  {Number(movement.inUnitCost) > 0
                    ? `${Number(movement.inUnitCost).toFixed(2)}`
                    : "-"}
                </td>
                <td>
                  {Number(movement.inTotalCost) > 0
                    ? `${Number(movement.inTotalCost).toFixed(2)}`
                    : "-"}
                </td>
                <td>{movement.outQty || "-"}</td>
                <td>
                  {Number(movement.outTotalCost) > 0
                    ? `${Number(movement.outTotalCost).toFixed(2)}`
                    : "-"}
                </td>
                <td>{movement.balance}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No stock movement found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default StockCardPage;
