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

// Function to format date to DD-MMM-YYYY
const formatDate = (dateString) => {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(dateString)
    .toLocaleDateString("en-GB", options)
    .replace(/ /g, "-");
};

const AddProductPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [batchNumber, setBatchNumber] = useState(""); // New state for batch number

  const [createProduct, { isLoading: productLoading, error: productError }] =
    useCreateProductMutation();
  const [createPurchase, { isLoading: purchaseLoading, error: purchaseError }] =
    useCreatePurchaseMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const navigate = useNavigate();

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      // First, create the product (without username)
      const productData = {
        name,
        quantity: 0,
        buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice),
        batchNumber, // Add batch number to product data
      };

      const createdProduct = await createProduct(productData).unwrap();
      console.log(createProduct, "created product");
      try {
        // Then, use the created product's ID to create the purchase
        const purchaseData = {
          productId: createdProduct.id, // Use productId from created product
          quantity: Number(quantity),
          buyingPrice: Number(buyingPrice),
          purchaseDate: date,
          userName: userInfo?.name, // Pass the userName for the purchase
        };

        await createPurchase(purchaseData).unwrap();

        // Redirect after successful addition
        navigate("/");
      } catch (purchaseError) {
        // If creating the purchase fails, delete the product
        console.error(
          "Purchase creation failed. Deleting product...",
          purchaseError
        );

        await deleteProduct(createdProduct._id).unwrap(); // Delete the product if purchase fails

        console.error("Product deleted after purchase creation failed.");

        // Optionally, display an error message to the user
        alert("Error creating purchase. Product creation was rolled back.");
      }
    } catch (productError) {
      console.error("Error creating product:", productError);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Add New Product</h2>

              <Form onSubmit={handleAddProduct}>
                {/* Product Name */}
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
                    {/* Buying Price */}
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
                    {/* Selling Price */}
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
                    {/* Quantity */}
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
                    {/* Date */}
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

                {/* Batch Number */}
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

                {/* Submit Button */}
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

                {/* Display Error Message */}
                {productError && (
                  <Alert variant="danger" className="mt-3">
                    {productError.data?.message || productError.error}
                  </Alert>
                )}
                {purchaseError && (
                  <Alert variant="danger" className="mt-3">
                    {purchaseError.data?.message || purchaseError.error}
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddProductPage;
