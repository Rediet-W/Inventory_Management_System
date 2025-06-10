import React, { useState } from "react";
import {
  useGetProductsQuery,
  useGetProductByIdQuery,
} from "../slices/productApiSlice";
import { useCreateAdjustmentMutation } from "../slices/adjustmentApiSlice";

import { Form, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { use } from "react";

const PurchaseAdjustmentPage = () => {
  const { data: products, isLoading } = useGetProductsQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");

  const [createAdjustment] = useCreateAdjustmentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find the selected product from the already fetched products list
      const selectedProduct = products?.find(
        (product) => product.id === selectedProductId
      );

      await createAdjustment({
        type: "purchase",
        referenceId: selectedProductId,
        batchNumber: selectedProduct?.batchNumber,
        mode: "requested",
        quantity: newQuantity,
        reason: reason,
        requestedBy: userInfo.name,
      }).unwrap();
      toast.success("Adjustment request submitted.");
    } catch (err) {
      toast.error("Failed to submit adjustment.");
    }
  };

  if (isLoading) return <Spinner animation="border" className="mt-4" />;

  return (
    <Container className="mt-5">
      <h3 className="text-center mb-4">Submit Purchase Adjustment</h3>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              <option value="">Select a Product</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.batchNumber}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control
              type="number"
              placeholder="New Quantity"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              required
            />
          </Col>
          <Col md={3}>
            <Button type="submit" variant="primary" className="w-100">
              Submit
            </Button>
          </Col>
        </Row>
        <Form.Group>
          <Form.Label>Reason</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Form.Group>
      </Form>
    </Container>
  );
};

export default PurchaseAdjustmentPage;
