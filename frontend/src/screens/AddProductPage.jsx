import React, { useState } from "react";
import {
  Button,
  Form,
  Container,
  Alert,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import { useCreateProductMutation } from "../slices/productApiSlice";
import { useCreatePurchaseMutation } from "../slices/purchaseApiSlice";
import { useNavigate } from "react-router-dom";
import { useDeleteProductMutation } from "../slices/productApiSlice";
import { useSelector } from "react-redux";

const AddProductPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [createProduct, { isLoading: productLoading }] =
    useCreateProductMutation();
  const [createPurchase, { isLoading: purchaseLoading }] =
    useCreatePurchaseMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const navigate = useNavigate();

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset errors

    if (!userInfo) {
      setErrorMessage("User not authenticated. Please log in.");
      return;
    }

    try {
      const productData = {
        name,
        quantity: 0, // Initial quantity
        buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice),
        batchNumber,
      };

      const createdProduct = await createProduct(productData).unwrap();

      try {
        const purchaseData = {
          productId: createdProduct.id,
          quantity: Number(quantity),
          buyingPrice: Number(buyingPrice),
          purchaseDate: date,
          userName: userInfo?.name,
        };

        await createPurchase(purchaseData).unwrap();
        navigate("/"); // Redirect to home
      } catch (purchaseError) {
        console.error(
          "❌ Purchase creation failed, rolling back...",
          purchaseError
        );

        // Delete the created product if purchase fails
        await deleteProduct(createdProduct.id).unwrap();

        setErrorMessage(
          "Error creating purchase. Product creation was rolled back."
        );
      }
    } catch (productError) {
      console.error("❌ Error creating product:", productError);
      setErrorMessage(
        productError.data?.message || "Failed to add product. Try again."
      );
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Add New Product</h2>

              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

              <Form onSubmit={handleAddProduct}>
                <Form.Group controlId="productName" className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group controlId="buyingPrice" className="mb-3">
                      <Form.Label>Buying Price</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter buying price"
                        value={buyingPrice}
                        onChange={(e) => setBuyingPrice(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="sellingPrice" className="mb-3">
                      <Form.Label>Selling Price</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter selling price"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group controlId="quantity" className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="date" className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="batchNumber" className="mb-3">
                  <Form.Label>Batch Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter batch number"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={productLoading || purchaseLoading}
                >
                  {productLoading || purchaseLoading
                    ? "Adding..."
                    : "Add Product"}
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
