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
import { triggerRefresh } from "../slices/refreshSlice"; // Import trigger for refresh
import { FaPlus } from "react-icons/fa"; // Import icons

const RequestedProductsPage = () => {
  const dispatch = useDispatch();
  const refreshKey = useSelector((state) => state.refresh.refreshKey);

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

  const { userInfo } = useSelector((state) => state.auth);

  // Modal state and pagination state
  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  // Handle modal show and hide
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setProductName("");
    setDescription("");
    setQuantity(1);
  };

  // Handle form submission
  const handleAddProduct = async () => {
    await createRequestedProduct({
      product_name: productName,
      description,
      quantity,
    });
    handleCloseModal();
    dispatch(triggerRefresh()); // Trigger refresh on addition
  };

  // Handle product deletion (bulk for admin)
  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete the selected products?")
    ) {
      for (const productId of selectedProducts) {
        await deleteRequestedProduct(productId);
      }
      setSelectedProducts([]);
      dispatch(triggerRefresh()); // Trigger refresh on deletion
    }
  };

  // Handle quantity update for users
  const handleQuantityChange = async (productId, newQuantity) => {
    await updateRequestedProduct({ id: productId, quantity: newQuantity });
    dispatch(triggerRefresh()); // Trigger refresh on update
  };

  // Handle admin product selection for deletion
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Sort products by quantity or timestamp (newest at top)
  const sortedRequestedProducts = requestedProducts
    ?.slice()
    .sort((a, b) => b.quantity - a.quantity);

  // Pagination logic
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

        {/* Add Requested Product Button for users (not admins) */}
        {userInfo?.role !== "admin" && (
          <Col className="text-end">
            <Button variant="primary" onClick={handleShowModal}>
              <FaPlus className="me-2" /> Add Requested Product
            </Button>
          </Col>
        )}

        {/* Delete Button for admins */}
        {userInfo?.role === "admin" && selectedProducts.length > 0 && (
          <Col className="text-end">
            <Button variant="danger" onClick={handleDelete}>
              Delete Selected Products
            </Button>
          </Col>
        )}
      </Row>

      {/* Loading and error handling */}
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
                    value={product.quantity || 1}
                    min="1"
                    onChange={(e) =>
                      handleQuantityChange(product.id, e.target.value)
                    }
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

      {/* Modal for adding requested product */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Requested Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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

            <Form.Group controlId="description" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="quantity" className="mt-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
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
