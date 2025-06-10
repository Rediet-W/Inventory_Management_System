import React, { useState, useEffect } from "react";
import { Table, Form, Row, Col, Spinner, Card, Badge } from "react-bootstrap";
import {
  useGetAllTransfersQuery,
  useGetTransferByBatchNumberQuery,
} from "../slices/transferApiSlice";
import {
  useGetAllSalesQuery,
  useGetSalesByBatchNumberQuery,
} from "../slices/salesApiSlice";
import { useGetProductByBatchNumberQuery } from "../slices/productApiSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ShopCardPage = () => {
  const { data: transfers, isLoading: isLoadingTransfers } =
    useGetAllTransfersQuery();
  const { data: sales, isLoading: isLoadingSales } = useGetAllSalesQuery();

  const [selectedBatch, setSelectedBatch] = useState("");
  const [shopMovements, setShopMovements] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);

  const { data: batchTransfers, isLoading: isLoadingBatchTransfers } =
    useGetTransferByBatchNumberQuery(selectedBatch, { skip: !selectedBatch });

  const {
    data: batchSales,
    isLoading: isLoadingBatchSales,
    error: salesError,
  } = useGetSalesByBatchNumberQuery(selectedBatch, { skip: !selectedBatch });

  const { data: product, isLoading: isLoadingProduct } =
    useGetProductByBatchNumberQuery(selectedBatch, { skip: !selectedBatch });

  useEffect(() => {
    if (transfers && sales) {
      const transferBatches = transfers.map((t) => t.batchNumber);
      const salesBatches = sales.map((s) => s.batchNumber);
      const uniqueBatches = [...new Set([...transferBatches, ...salesBatches])];
      setBatchNumbers(uniqueBatches);
    }
  }, [transfers, sales]);

  useEffect(() => {
    if (selectedBatch && batchTransfers) {
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
        toast.warn(`No sales found for batch ${selectedBatch}`, {
          position: "top-center",
          autoClose: 3000,
        });
      }

      const movements = [...transferRecords, ...salesRecords].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      let balance = 0;
      const updatedMovements = movements.map((record) => {
        balance += record.inQty - record.outQty;
        return { ...record, balance };
      });

      setShopMovements(updatedMovements);
    }
  }, [selectedBatch, batchTransfers, batchSales, product, salesError]);

  const isLoading =
    isLoadingTransfers ||
    isLoadingSales ||
    isLoadingProduct ||
    isLoadingBatchTransfers ||
    isLoadingBatchSales;

  return (
    <div className="container-fluid p-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0" style={{ color: "#1E43FA" }}>
              Shop Card
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
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
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
                    shopMovements.map((movement, index) => {
                      // Properly check for negative values
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
                          <td>
                            <Badge
                              bg={
                                movement.ref === "Sale" ? "info" : "secondary"
                              }
                              className="text-uppercase"
                            >
                              {movement.ref}
                            </Badge>
                          </td>
                          <td>{movement.inQty || "-"}</td>
                          <td>
                            {movement.inTotalCost > 0
                              ? movement.inTotalCost.toFixed(2)
                              : "-"}
                          </td>
                          <td>{movement.outQty || "-"}</td>
                          <td>
                            {movement.outUnitPrice > 0
                              ? movement.outUnitPrice.toFixed(2)
                              : "-"}
                          </td>
                          <td>
                            {movement.outTotalPrice > 0
                              ? movement.outTotalPrice.toFixed(2)
                              : "-"}
                          </td>
                          <td>
                            <span
                              className={
                                movement.balance < 0
                                  ? "text-danger fw-bold"
                                  : ""
                              }
                            >
                              {movement.balance}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        {selectedBatch
                          ? "No movements found"
                          : "Select a batch to view movements"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ShopCardPage;
