import React, { useState, useMemo } from "react";
import {
  Button,
  Form,
  Container,
  Table,
  Alert,
  Card,
  Row,
  Col,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useCreatePurchaseMutation } from "../slices/purchaseApiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PurchasePDF from "../pdfs/PurchasePDF";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProductPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    {
      name: "",
      unitCost: "",
      quantity: "",
      unitOfMeasurement: "",
      batchNumber: "",
      reference: "",
    },
  ]);
  const [completedPurchases, setCompletedPurchases] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [createPurchase, { isLoading }] = useCreatePurchaseMutation();

  const handleChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const addRow = () => {
    setProducts([
      ...products,
      {
        name: "",
        unitCost: "",
        quantity: "",
        unitOfMeasurement: "",
        batchNumber: "",
        reference: "",
      },
    ]);
  };

  const totalPurchase = useMemo(() => {
    return (
      products.reduce(
        (total, product) =>
          total +
          (parseFloat(product.unitCost) || 0) *
            (parseFloat(product.quantity) || 0),
        0
      ) || 0
    );
  }, [products]);

  const totalPurchase2 = useMemo(() => {
    return (
      completedPurchases.reduce(
        (total, product) =>
          total +
          (parseFloat(product.unitCost) || 0) *
            (parseFloat(product.quantity) || 0),
        0
      ) || 0
    );
  }, [completedPurchases]);

  const removeRow = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!userInfo) {
      setErrorMessage("User not authenticated. Please log in.");
      toast.error("User not authenticated. Please log in.");
      return;
    }

    try {
      const purchaseData = products.map((product) => ({
        ...product,
        unitCost: parseFloat(product.unitCost),
        quantity: parseFloat(product.quantity),
        purchaser: userInfo.name,
      }));

      for (const product of purchaseData) {
        await createPurchase(product).unwrap();
      }

      setCompletedPurchases(products); // Save completed purchases for PDF
      setProducts([
        {
          name: "",
          unitCost: "",
          quantity: "",
          unitOfMeasurement: "",
          batchNumber: "",
          reference: "",
        },
      ]);
      setShowDownloadModal(true); // Show the download modal
      toast.success("Purchases added successfully!");
    } catch (error) {
      console.error("❌ Error adding purchases:", error);
      setErrorMessage(error?.message || "Failed to add purchases. Try again.");
      toast.error(
        error?.data?.message || "Failed to add purchases. Try again."
      );
    }
  };

  return (
    <Container fluid className="p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="mb-0" style={{ color: "#1E43FA" }}>
            Add Purchases
          </h3>

          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Batch Number</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th>UOM</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={product.batchNumber}
                          onChange={(e) =>
                            handleChange(index, "batchNumber", e.target.value)
                          }
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={product.name}
                          onChange={(e) =>
                            handleChange(index, "name", e.target.value)
                          }
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={product.reference}
                          onChange={(e) =>
                            handleChange(index, "reference", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={product.unitOfMeasurement}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "unitOfMeasurement",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={product.quantity}
                          onChange={(e) =>
                            handleChange(index, "quantity", e.target.value)
                          }
                          required
                          min="1"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={product.unitCost}
                          onChange={(e) =>
                            handleChange(index, "unitCost", e.target.value)
                          }
                          required
                          min="0.01"
                          step="0.01"
                        />
                      </td>
                      <td>
                        {(product.unitCost * product.quantity || 0).toFixed(2)}
                      </td>
                      <td>
                        {products.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeRow(index)}
                            className="rounded-circle"
                          >
                            ×
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan="6">Total</td>
                    <td colSpan="2">{totalPurchase.toFixed(2)} ETB</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            <div className="d-flex gap-3 mt-3">
              <Button variant="outline-primary" onClick={addRow}>
                + Add Row
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" />{" "}
                    Submitting...
                  </>
                ) : (
                  "Submit Purchases"
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>

      <Modal
        show={showDownloadModal}
        onHide={() => setShowDownloadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Download Purchase Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to download the purchase receipt as a PDF?
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
              <PurchasePDF
                purchases={completedPurchases}
                date={new Date().toLocaleDateString()}
                totalPurchase={totalPurchase2}
              />
            }
            fileName="Purchase_Receipt.pdf"
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
    </Container>
  );
};

export default AddProductPage;
