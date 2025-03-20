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
} from "react-bootstrap";
import { useCreatePurchaseMutation } from "../slices/purchaseApiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PurchasePDF from "../pdfs/PurchasePDF";

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
  const [completedPurchases, setCompletedPurchases] = useState([]); // Store completed purchases
  const [errorMessage, setErrorMessage] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false); // Modal state
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
  }, [products]);

  const removeRow = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!userInfo) {
      setErrorMessage("User not authenticated. Please log in.");
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
      setProducts([]); // Clear the form
      setShowDownloadModal(true); // Show the download modal
    } catch (error) {
      console.error("❌ Error adding purchases:", error);
      setErrorMessage(error?.message || "Failed to add purchases. Try again.");
    }
  };
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Add Purchases</h2>

              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Table bordered hover>
                  <thead>
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
                            value={product.reference}
                            onChange={(e) =>
                              handleChange(index, "reference", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
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
                            value={product.quantity}
                            onChange={(e) =>
                              handleChange(index, "quantity", e.target.value)
                            }
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={product.unitCost}
                            onChange={(e) =>
                              handleChange(index, "unitCost", e.target.value)
                            }
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={product.unitCost * product.quantity}
                            disabled
                          />
                        </td>
                        <td>
                          {products.length > 1 && (
                            <Button
                              variant="danger"
                              onClick={() => removeRow(index)}
                            >
                              -
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan="6">Total </td>
                      <td colSpan="2">{totalPurchase} ETB</td>
                    </tr>
                  </tbody>
                </Table>
                <Button variant="primary" onClick={addRow} className="me-2">
                  + Add Row
                </Button>
                <Button variant="success" type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Submit Purchases"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Download Confirmation Modal */}
      <Modal
        show={showDownloadModal}
        onHide={() => setShowDownloadModal(false)}
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
