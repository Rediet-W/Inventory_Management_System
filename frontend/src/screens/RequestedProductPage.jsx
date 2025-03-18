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
  InputGroup,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetRequestedProductsQuery,
  useCreateRequestedProductMutation,
  useDeleteRequestedProductMutation,
  useUpdateRequestedProductMutation,
} from "../slices/requestedProductApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import { FaPlus, FaSearch } from "react-icons/fa";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("pending"); // Status field
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [inputStatuses, setInputStatuses] = useState({}); // Store status edits
  const [editableQuantities, setEditableQuantities] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  const handleShowModal = () => {
    setErrorMessage("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setName("");
    setDescription("");
    setQuantity(1);
    setStatus("pending");
  };

  const handleAddProduct = async () => {
    setErrorMessage("");
    try {
      const response = await createRequestedProduct({
        name,
        description,
        quantity,
        status,
      }).unwrap();

      console.log("✅ Product Created:", response);
      handleCloseModal();
      dispatch(triggerRefresh());
    } catch (err) {
      console.error("❌ Failed to add product:", err);
      setErrorMessage(err?.data?.message || "Error adding product");
    }
  };

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

  const handleStatusChange = async (productId) => {
    const newStatus = inputStatuses[productId] || "pending";

    try {
      await updateRequestedProduct({
        id: productId,
        status: newStatus,
      }).unwrap();
      dispatch(triggerRefresh());
    } catch (err) {
      console.error("❌ Failed to update status:", err);
      setErrorMessage(err?.data?.message || "Error updating status.");
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };
  const filteredProducts = requestedProducts?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRequestedProducts = filteredProducts
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

  const handleQuantityUpdate = async (productId) => {
    const newQuantity = parseInt(editableQuantities[productId], 10);

    const product = requestedProducts?.find((p) => p.id === productId);
    if (
      !product ||
      isNaN(newQuantity) ||
      newQuantity <= 0 ||
      newQuantity === product.quantity
    ) {
      setEditableQuantities((prev) => ({
        ...prev,
        [productId]: undefined,
      }));
      return;
    }

    try {
      await updateRequestedProduct({
        id: productId,
        quantity: newQuantity,
      }).unwrap();
      dispatch(triggerRefresh());
    } catch (err) {
      console.error("❌ Failed to update quantity:", err);
      setErrorMessage(err?.data?.message || "Error updating quantity.");
    } finally {
      setEditableQuantities((prev) => ({
        ...prev,
        [productId]: undefined,
      }));
    }
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="text-center">Lost Sales</h2>
        </Col>

        {/* ✅ Show "Add Requested Product" Button for Users */}
        {userInfo?.role !== "admin" && (
          <Col className="text-end">
            <Button variant="primary" onClick={handleShowModal}>
              <FaPlus className="me-2" /> Add Requested Product
            </Button>
          </Col>
        )}

        {/* ✅ Show Delete Button for Admins */}
        {userInfo?.role === "admin" && selectedProducts.length > 0 && (
          <Col className="text-end">
            <Button variant="danger" onClick={handleDelete}>
              Delete Selected Products
            </Button>
          </Col>
        )}
      </Row>
      <Row className="justify-content-end mb-3">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive className="table-sm shadow-sm">
          <thead className="">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Status</th>
              {userInfo?.role === "admin" && <th>Select</th>}
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td
                  onClick={() => {
                    if (userInfo?.role !== "admin") {
                      setEditableQuantities((prev) => ({
                        ...prev,
                        [product.id]: product.quantity,
                      }));
                    }
                  }}
                >
                  {userInfo?.role !== "admin" &&
                  editableQuantities[product.id] !== undefined ? (
                    <Form.Control
                      type="number"
                      min="1"
                      value={editableQuantities[product.id]}
                      onChange={(e) =>
                        setEditableQuantities({
                          ...editableQuantities,
                          [product.id]: e.target.value,
                        })
                      }
                      onBlur={() => handleQuantityUpdate(product.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuantityUpdate(product.id);
                      }}
                      autoFocus
                    />
                  ) : (
                    product.quantity
                  )}
                </td>

                <td>
                  {userInfo?.role === "admin" ? (
                    <Form.Select
                      value={inputStatuses[product.id] ?? product.status}
                      onChange={(e) =>
                        setInputStatuses({
                          ...inputStatuses,
                          [product.id]: e.target.value,
                        })
                      }
                      onBlur={() => handleStatusChange(product.id)}
                    >
                      <option value="pending">Pending</option>
                      <option value="purchased">Purchased</option>
                    </Form.Select>
                  ) : (
                    product.status
                  )}
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

      {/* Pagination */}
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

      {/* ✅ Modal for adding a product */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Requested Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form>
            <Form.Group controlId="name">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
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
