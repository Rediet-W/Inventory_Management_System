import React, { useState } from "react";
import {
  Button,
  Form,
  Container,
  Table,
  Alert,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import { useCreatePurchaseMutation } from "../slices/purchaseApiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

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
  const [errorMessage, setErrorMessage] = useState("");
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
        purchaser: userInfo.name, // Automatically set purchaser
      }));
      console.log(purchaseData, "purchaseData");
      for (const product of purchaseData) {
        await createPurchase(product).unwrap();
        console.log(product, "each");
      }
      navigate("/");
    } catch (error) {
      console.error("❌ Error adding purchases:", error);
      setErrorMessage(error?.message || "Failed to add purchases. Try again.");
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Date: " + new Date().toLocaleDateString(), 10, 10);
    doc.text("I have received the above-listed items:", 10, 20);
    let y = 30;

    products.forEach((product, index) => {
      doc.text(
        `${index + 1}. ${product.name} - ${product.quantity} ${
          product.unitOfMeasurement
        } (Batch: ${product.batchNumber})`,
        10,
        y
      );
      y += 10;
    });

    doc.text("\n\nSignature: ______________________", 10, y + 20);
    doc.text("Name: ___________________________", 10, y + 30);
    doc.text("Date: ___________________________", 10, y + 40);
    doc.save("purchase_receipt.pdf");
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Add New Products</h2>

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
                  </tbody>
                </Table>
                <Button variant="secondary" onClick={addRow} className="me-2">
                  + Add Row
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Submit Purchases"}
                </Button>
                <Button
                  variant="success"
                  className="ms-2"
                  onClick={downloadPDF}
                >
                  Download Receipt
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddProductPage;
