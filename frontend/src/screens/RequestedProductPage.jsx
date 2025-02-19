import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetRequestedProductsQuery,
  useCreateRequestedProductMutation,
  useDeleteRequestedProductMutation,
  useUpdateRequestedProductMutation,
} from "../slices/requestedProductApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import { FaPlus } from "react-icons/fa";

const RequestedProductsPage = () => {
  const dispatch = useDispatch();
  const refreshKey = useSelector((state) => state.refresh.refreshKey);
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch requested products, re-fetch on refreshKey change
  const {
    data: requestedProducts,
    isLoading,
    error,
    refetch,
  } = useGetRequestedProductsQuery();

  const [createRequestedProduct] = useCreateRequestedProductMutation();
  const [deleteRequestedProduct] = useDeleteRequestedProductMutation();
  const [updateRequestedProduct] = useUpdateRequestedProductMutation();

  // Modal state and pagination state
  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState(""); // 🔴 State for error messages
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [inputQuantities, setInputQuantities] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  const handleShowModal = () => {
    setErrorMessage(""); // Clear errors when opening modal
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProductName("");
    setDescription("");
    setQuantity(1);
  };

  // ✅ Handle Add Product with error handling
  const handleAddProduct = async () => {
    setErrorMessage(""); // Reset error message

    try {
      const response = await createRequestedProduct({
        product_name: productName,
        description,
        quantity,
      }).unwrap();

      console.log("✅ Product Created:", response);
      handleCloseModal();
      dispatch(triggerRefresh());
    } catch (err) {
      console.error("❌ Failed to add product:", err);
      setErrorMessage(
        err?.data?.errors?.join(", ") ||
          err?.data?.message ||
          "Error adding product"
      );
    }
  };

  // ✅ Handle Delete Product with error handling
  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete the selected products?")
    ) {
      try {
        for (const productId of selectedProducts) {
          await deleteRequestedProduct(productId).unwrap();
        }
        setSelectedProducts([]);
        dispatch(triggerRefresh());
      } catch (err) {
        console.error("❌ Failed to delete products:", err);
        setErrorMessage(
          err?.data?.message || "Error deleting requested product(s)"
        );
      }
    }
  };

  // ✅ Handle Quantity Update with error handling
  const handleQuantityInputChange = (productId, newValue) => {
    setInputQuantities((prev) => ({
      ...prev,
      [productId]: newValue, // Update local state while typing
    }));
  };

  const handleQuantityUpdate = async (productId) => {
    const newQuantity = parseInt(inputQuantities[productId], 10);

    if (!newQuantity || isNaN(newQuantity) || newQuantity <= 0) {
      setErrorMessage("Quantity must be a valid number greater than 0.");
      return;
    }

    try {
      await updateRequestedProduct({
        id: productId,
        quantity: newQuantity,
      }).unwrap();
      dispatch(triggerRefresh());
      setErrorMessage(""); // Clear errors after successful update
    } catch (err) {
      console.error("❌ Failed to update quantity:", err);
      setErrorMessage(err?.data?.message || "Error updating quantity.");
    }
  };
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const sortedRequestedProducts = requestedProducts
    ?.slice()
    .sort((a, b) => b.quantity - a.quantity);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedRequestedProducts?.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(
    (sortedRequestedProducts?.length || 0) / productsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="text-center">Requested Products</h2>
        </Col>

        {userInfo?.role !== "admin" && (
          <Col className="text-end">
            <Button variant="primary" onClick={handleShowModal}>
              <FaPlus className="me-2" /> Add Requested Product
            </Button>
          </Col>
        )}

        {userInfo?.role === "admin" && selectedProducts.length > 0 && (
          <Col className="text-end">
            <Button variant="danger" onClick={handleDelete}>
              Delete Selected Products
            </Button>
          </Col>
        )}
      </Row>

      {/* ✅ Show API Errors */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          Error loading requested products
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="table-sm shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Product Name</th>
              <th>Description</th>
              <th>Number of requests</th>
              {userInfo?.role === "admin" && <th>Select for Deletion</th>}
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.product_name}</td>
                <td>{product.description}</td>
                <td>
                  <Form.Control
                    type="number"
                    value={inputQuantities[product.id] ?? product.quantity} // Use local state first
                    min="1"
                    onChange={(e) =>
                      handleQuantityInputChange(product.id, e.target.value)
                    }
                    onBlur={() => handleQuantityUpdate(product.id)} // Update only when user finishes editing
                  />
                </td>

                {userInfo?.role === "admin" && (
                  <td>
                    <Form.Check
                      type="checkbox"
                      onChange={() => handleSelectProduct(product.id)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Pagination controls */}
      <Pagination className="justify-content-center mt-4">
        {[...Array(totalPages).keys()].map((number) => (
          <Pagination.Item
            key={number + 1}
            active={number + 1 === currentPage}
            onClick={() => handlePageChange(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      {/* Modal for adding product */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Requested Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form>
            <Form.Group controlId="productName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddProduct}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestedProductsPage;
