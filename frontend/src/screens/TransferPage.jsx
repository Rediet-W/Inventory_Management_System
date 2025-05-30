import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Row,
  Col,
  Form,
  Modal,
  Spinner,
  Badge,
  Card,
} from "react-bootstrap";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { useCreateTransferMutation } from "../slices/transferApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import { useSelector, useDispatch } from "react-redux";
import { PDFDownloadLink } from "@react-pdf/renderer";
import TransferPDF from "../pdfs/TransferPdf";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransferPage = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: products, isLoading, error } = useGetProductsQuery();
  const [createTransfer, { isLoading: isSubmitting }] =
    useCreateTransferMutation();

  const [transfers, setTransfers] = useState([]);
  const [completedTransfers, setCompletedTransfers] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [date] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (products?.length > 0) {
      setTransfers([
        {
          id: Date.now(),
          product: "",
          batchNumber: "",
          unitOfMeasurement: "",
          sellingPrice: "",
          qty: 0,
          quantityToTransfer: "",
          reorderLevel: "",
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
        reorderLevel: "",
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    if (transfers.length <= 1) {
      toast.warning("At least one transfer row must remain");
      return;
    }
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
              reorderLevel: product.reorderLevel || "",
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
      toast.error(
        "Ensure transfer quantity is valid and less than available stock"
      );
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
            storeKeeper: userInfo.name,
            reorderLevel: Number(transfer.reorderLevel) || 0,
          }).unwrap()
        )
      );

      toast.success("Transfers completed successfully!");
      dispatch(triggerRefresh());
      setCompletedTransfers(transfers);
      setTransfers([]);
      setShowDownloadModal(true);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to complete transfers");
    }
  };

  if (isLoading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error) {
    toast.error("Error loading products");
    return null;
  }

  return (
    <div className="container-fluid p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-center mb-2">
            Product Transfer to Shop
          </h3>
          <h5 className="text-center text-muted mb-4">Date: {date}</h5>

          <Row className="mb-4">
            <Col md={8}>
              <Button variant="outline-primary" onClick={handleAddRow}>
                + Add Transfer Row
              </Button>
            </Col>
            <Col md={4} className="text-end">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || transfers.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" />{" "}
                    Processing...
                  </>
                ) : (
                  "Complete Transfer"
                )}
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Batch No.</th>
                  <th>UOM</th>
                  <th>Price</th>
                  <th>In Stock</th>
                  <th>To Transfer</th>
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
                        size="sm"
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option
                            key={product.batchNumber}
                            value={product.name}
                          >
                            {product.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>{transfer.batchNumber}</td>
                    <td>{transfer.unitOfMeasurement}</td>
                    <td>{transfer.sellingPrice}</td>
                    <td
                      className={
                        transfer.quantityToTransfer > transfer.qty
                          ? "text-danger fw-bold"
                          : ""
                      }
                    >
                      {transfer.qty}
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
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
                        size="sm"
                        value={transfer.reorderLevel}
                        onChange={(e) =>
                          handleReorderLevelChange(transfer.id, e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveRow(transfer.id)}
                        className="rounded-circle"
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <Modal
        show={showDownloadModal}
        onHide={() => setShowDownloadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Download Transfer Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Would you like to download the transfer report as a PDF?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDownloadModal(false)}
          >
            Cancel
          </Button>
          <PDFDownloadLink
            document={
              <TransferPDF transfers={completedTransfers} date={date} />
            }
            fileName={`Transfer_Report_${date}.pdf`}
          >
            {({ loading }) => (
              <Button variant="primary" disabled={loading}>
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransferPage;
