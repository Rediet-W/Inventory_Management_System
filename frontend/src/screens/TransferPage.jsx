import React, { useState, useEffect } from "react";
import { Table, Button, Row, Col, Form, Alert, Modal } from "react-bootstrap";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { useCreateTransferMutation } from "../slices/transferApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import { useSelector, useDispatch } from "react-redux";
import { PDFDownloadLink } from "@react-pdf/renderer";
import TransferPDF from "../pdfs/TransferPdf";

const TransferPage = () => {
  const dispatch = useDispatch();
  const { data: products, isLoading, error } = useGetProductsQuery();
  const [createTransfer, { isLoading: isSubmitting }] =
    useCreateTransferMutation();
  const [transfers, setTransfers] = useState([]); // Active transfers
  const [completedTransfers, setCompletedTransfers] = useState([]); // Completed transfers for PDF
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false); // Modal state
  const [signature] = useState("Storekeeper Name"); // Signature added only in download
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (products && products.length > 0) {
      setTransfers([
        {
          id: Date.now(),
          product: "",
          batchNumber: "",
          unitOfMeasurement: "",
          sellingPrice: "",
          qty: 0,
          quantityToTransfer: "",
          reorderLevel: "", // Editable field with default value
        },
      ]);
    }
  }, [products]);

  const handleAddRow = () => {
    setTransfers([
      ...transfers,
      {
        id: Date.now(),
        product: "",
        batchNumber: "",
        unitOfMeasurement: "",
        sellingPrice: "",
        qty: 0,
        quantityToTransfer: "",
        reorderLevel: "", // Editable field
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    setTransfers(transfers.filter((transfer) => transfer.id !== id));
  };

  const handleProductSelect = (id, selectedProduct) => {
    const product = products.find((p) => p.name === selectedProduct);
    setTransfers((prev) =>
      prev.map((transfer) =>
        transfer.id === id
          ? {
              ...transfer,
              product: selectedProduct,
              batchNumber: product.batchNumber,
              unitOfMeasurement: product.unitOfMeasurement,
              sellingPrice: product.sellingPrice,
              qty: product.quantity,
              quantityToTransfer: "",
              reorderLevel: product.reorderLevel || "", // Default value but editable
            }
          : transfer
      )
    );
  };

  const handleQuantityChange = (id, value) => {
    setTransfers((prev) =>
      prev.map((transfer) =>
        transfer.id === id
          ? { ...transfer, quantityToTransfer: value }
          : transfer
      )
    );
  };

  const handleReorderLevelChange = (id, value) => {
    setTransfers((prev) =>
      prev.map((transfer) =>
        transfer.id === id ? { ...transfer, reorderLevel: value } : transfer
      )
    );
  };

  const handleSubmit = async () => {
    const invalidTransfers = transfers.filter(
      (t) => t.quantityToTransfer > t.qty || t.quantityToTransfer <= 0
    );
    if (invalidTransfers.length > 0) {
      setErrorMessage(
        "❌ Ensure transfer quantity is valid and less than available stock."
      );
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    try {
      await Promise.all(
        transfers.map((transfer) =>
          createTransfer({
            name: transfer.product,
            batchNumber: transfer.batchNumber,
            unitOfMeasurement: transfer.unitOfMeasurement,
            sellingPrice: transfer.sellingPrice,
            quantity: Number(transfer.quantityToTransfer),
            reference: "Stock Transfer",
            storeKeeper: userInfo.name, // Signature is not in UI, but in download
            reorderLevel: Number(transfer.reorderLevel) || 0, // Editable Reorder Level
          }).unwrap()
        )
      );

      alert("✅ Transfers completed successfully!");
      dispatch(triggerRefresh());
      setCompletedTransfers(transfers); // Save the completed transfers for PDF
      setTransfers([]); // Clear the active transfers
      setErrorMessage(null);
      setShowDownloadModal(true); // Show the download modal
    } catch (error) {
      setErrorMessage("❌ Failed to complete transfers.");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">Error loading products</Alert>;

  return (
    <div className="container mt-5">
      <h3 className="text-center">Product Transfer to Shop</h3>
      <h4 className="text-center">Date: {date}</h4>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Row className="mb-3 mt-3">
        <Col md={9}>
          <Button variant="primary" onClick={handleAddRow}>
            + Add Row
          </Button>
        </Col>
        <Col md={3} className="text-end">
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Transfer"}
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="table-sm mt-3">
        <thead>
          <tr>
            <th>No.</th>
            <th>Product</th>
            <th>Batch No.</th>
            <th>UOM</th>
            <th>Selling Price</th>
            <th>Qty in Store</th>
            <th>Qty to Transfer</th>
            <th>Reorder Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer, index) => (
            <tr key={transfer.id}>
              <td>{index + 1}</td>
              <td>
                <Form.Select
                  value={transfer.product}
                  onChange={(e) =>
                    handleProductSelect(transfer.id, e.target.value)
                  }
                  style={{ fontSize: "0.9rem" }}
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.batchNumber} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>{transfer.batchNumber}</td>
              <td>{transfer.unitOfMeasurement}</td>
              <td>{transfer.sellingPrice}</td>
              <td>{transfer.qty}</td>
              <td>
                <Form.Control
                  type="number"
                  value={transfer.quantityToTransfer}
                  onChange={(e) =>
                    handleQuantityChange(transfer.id, e.target.value)
                  }
                  min="1"
                  max={transfer.qty}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={transfer.reorderLevel}
                  onChange={(e) =>
                    handleReorderLevelChange(transfer.id, e.target.value)
                  }
                />
              </td>
              <td>
                <Button
                  className="bg-transparent"
                  size="sm"
                  onClick={() => handleRemoveRow(transfer.id)}
                >
                  ❌
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Download Confirmation Modal */}
      <Modal
        show={showDownloadModal}
        onHide={() => setShowDownloadModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Download Transfer Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to download the transfer report as a PDF?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDownloadModal(false)}
          >
            No, Thanks
          </Button>
          <PDFDownloadLink
            document={
              <TransferPDF transfers={completedTransfers} date={date} />
            }
            fileName="Transfers.pdf"
          >
            {({ loading }) => (
              <Button
                variant="primary"
                disabled={loading}
                onClick={() => setShowDownloadModal(false)}
              >
                {loading ? "Generating PDF..." : "Yes, Download"}
              </Button>
            )}
          </PDFDownloadLink>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransferPage;
