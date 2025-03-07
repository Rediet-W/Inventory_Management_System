import React, { useState, useEffect } from "react";
import { Table, Form, Row, Col } from "react-bootstrap";
import {
  useGetAllTransfersQuery,
  useGetTransferByBatchNumberQuery,
} from "../slices/transferApiSlice";
import {
  useGetAllSalesQuery,
  useGetSalesByBatchNumberQuery,
} from "../slices/salesApiSlice";
import { useGetProductByBatchNumberQuery } from "../slices/productApiSlice";

const ShopCardPage = () => {
  // Fetch all Transfers & Sales to determine batch numbers
  const { data: transfers, isLoading: isLoadingTransfers } =
    useGetAllTransfersQuery();
  const { data: sales, isLoading: isLoadingSales } = useGetAllSalesQuery();

  const [selectedBatch, setSelectedBatch] = useState("");
  const [shopMovements, setShopMovements] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);

  // Fetch detailed Transfers & Sales based on selected batch
  const { data: batchTransfers, isLoading: isLoadingBatchTransfers } =
    useGetTransferByBatchNumberQuery(selectedBatch, { skip: !selectedBatch });

  const {
    data: batchSales,
    isLoading: isLoadingBatchSales,
    error: salesError,
  } = useGetSalesByBatchNumberQuery(selectedBatch, { skip: !selectedBatch });

  // Fetch Product Details
  const { data: product, isLoading: isLoadingProduct } =
    useGetProductByBatchNumberQuery(selectedBatch, { skip: !selectedBatch });

  // **Fetch Unique Batch Numbers**
  useEffect(() => {
    if (transfers && sales) {
      const transferBatches = transfers.map((t) => t.batchNumber);
      const salesBatches = sales.map((s) => s.batchNumber);
      const uniqueBatches = [...new Set([...transferBatches, ...salesBatches])];
      setBatchNumbers(uniqueBatches);
    }
  }, [transfers, sales]);
  console.log(batchTransfers);
  // **Update Shop Movements when Batch is Selected**
  useEffect(() => {
    if (selectedBatch && batchTransfers) {
      // Create transfer records
      const transferRecords = batchTransfers.map((t) => ({
        date: t.createdAt,
        ref: t.reference || "Transfer",
        inQty: Number(t.quantity) || 0,
        inTotalCost: (Number(t.quantity) || 0) * (product?.averageCost || 0),
        outQty: 0,
        outUnitPrice: 0,
        outTotalPrice: 0,
      }));

      let salesRecords = [];
      if (batchSales && batchSales.length > 0) {
        salesRecords = batchSales.map((s) => ({
          date: s.createdAt,
          ref: s.reference || "Sale",
          inQty: 0,
          inTotalCost: 0,
          outQty: Number(s.quantity) || 0,
          outUnitPrice: Number(s.unitSellingPrice) || 0,
          outTotalPrice:
            (Number(s.quantity) || 0) * (Number(s.unitSellingPrice) || 0),
        }));
      } else if (salesError) {
        console.warn(
          `⚠️ No sales found for batch ${selectedBatch}. Showing only transfers.`
        );
      }

      // Combine Transfers & Sales, Sort by Date
      const movements = [...transferRecords, ...salesRecords].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Compute Balance
      let balance = 0;
      const updatedMovements = movements.map((record) => {
        balance += record.inQty - record.outQty;
        return { ...record, balance };
      });

      setShopMovements(updatedMovements);
    }
  }, [selectedBatch, batchTransfers, batchSales, product, salesError]);

  if (
    isLoadingTransfers ||
    isLoadingSales ||
    isLoadingProduct ||
    isLoadingBatchTransfers ||
    isLoadingBatchSales
  )
    return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <h3 className="text-center">Shop Card</h3>

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

      {/* Shop Card Table with Grouped Headers */}
      <Table striped bordered hover responsive className="table-sm mt-3">
        <thead>
          <tr>
            <th rowSpan="2">Date</th>
            <th rowSpan="2">Reference</th>
            <th colSpan="2" className="text-center">
              In
            </th>
            <th colSpan="3" className="text-center">
              Out
            </th>
            <th rowSpan="2">Balance</th>
          </tr>
          <tr>
            <th>Qty</th>
            <th>Total Cost</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {shopMovements.length > 0 ? (
            shopMovements.map((movement, index) => (
              <tr key={index}>
                <td>{new Date(movement.date).toLocaleDateString()}</td>
                <td>{movement.ref}</td>
                <td>{movement.inQty || "-"}</td>
                <td>
                  {Number(movement.inTotalCost) > 0
                    ? `${Number(movement.inTotalCost).toFixed(2)}`
                    : "-"}
                </td>
                <td>{movement.outQty || "-"}</td>
                <td>
                  {Number(movement.outUnitPrice) > 0
                    ? `${Number(movement.outUnitPrice).toFixed(2)}`
                    : "-"}
                </td>
                <td>
                  {Number(movement.outTotalPrice) > 0
                    ? `${Number(movement.outTotalPrice).toFixed(2)}`
                    : "-"}
                </td>
                <td>{movement.balance}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No shop movement found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ShopCardPage;
