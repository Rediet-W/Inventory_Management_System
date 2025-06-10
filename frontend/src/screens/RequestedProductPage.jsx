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
  Pagination,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetRequestedProductsQuery,
  useCreateRequestedProductMutation,
  useDeleteRequestedProductMutation,
  useUpdateRequestedProductMutation,
} from "../slices/requestedProductApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RequestedProductsPage = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const {
    data: requestedProducts,
    isLoading,
    error,
    refetch,
  } = useGetRequestedProductsQuery();

  const [createRequestedProduct] = useCreateRequestedProductMutation();
  const [deleteRequestedProduct] = useDeleteRequestedProductMutation();
  const [updateRequestedProduct] = useUpdateRequestedProductMutation();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("pending");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [inputStatuses, setInputStatuses] = useState({});
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [tempQuantity, setTempQuantity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const productsPerPage = 10;

  useEffect(() => {
    if (error) {
      toast.error("Error loading requested products");
    }
  }, [error]);

  const handleAddProduct = async () => {
    try {
      await createRequestedProduct({
        name,
        description,
        quantity,
        status,
      }).unwrap();
      toast.success("Product requested successfully");
      handleCloseModal();
      dispatch(triggerRefresh());
    } catch (err) {
      toast.error(err?.data?.message || "Error adding product");
    }
  };

  const handleDelete = async () => {
    try {
      const result = await new Promise((resolve) => {
        toast.info(
          <div>
            <p>
              Are you sure you want to delete {selectedProducts.length}{" "}
              product(s)?
            </p>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  toast.dismiss();
                  resolve(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  toast.dismiss();
                  resolve(true);
                }}
              >
                Delete
              </button>
            </div>
          </div>,
          {
            autoClose: false,
            closeButton: false,
          }
        );
      });

      if (result) {
        for (const productId of selectedProducts) {
          await deleteRequestedProduct(productId).unwrap();
        }
        setSelectedProducts([]);
        dispatch(triggerRefresh());
        toast.success("Products deleted successfully");
      }
    } catch (err) {
      toast.error("Error deleting requested product(s)");
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
      toast.success("Status updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Error updating status");
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleStartEdit = (productId, currentQuantity) => {
    setEditingQuantity(productId);
    setTempQuantity(currentQuantity);
  };

  const handleCancelEdit = () => {
    setEditingQuantity(null);
    setTempQuantity("");
  };

  const handleSaveEdit = async (productId) => {
    if (!tempQuantity || isNaN(tempQuantity) || tempQuantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      await updateRequestedProduct({
        id: productId,
        quantity: Number(tempQuantity),
      }).unwrap();
      dispatch(triggerRefresh());
      toast.success("Quantity updated successfully");
      setEditingQuantity(null);
      setTempQuantity("");
    } catch (err) {
      toast.error(err?.data?.message || "Error updating quantity");
    }
  };

  const filteredProducts = requestedProducts?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRequestedProducts = filteredProducts
    ?.slice()
    .sort((a, b) => b.quantity - a.quantity);

  const currentProducts = sortedRequestedProducts?.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const totalPages = Math.ceil(
    (sortedRequestedProducts?.length || 0) / productsPerPage
  );

  const handleCloseModal = () => {
    setShowModal(false);
    setName("");
    setDescription("");
    setQuantity(1);
    setStatus("pending");
  };

  return (
    <Container fluid className="p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <Row className="align-items-center mb-4">
            <Col>
              <h3 className="mb-0" style={{ color: "#1E43FA" }}>
                Lost Sales
              </h3>
            </Col>
            {userInfo?.role !== "admin" && (
              <Col className="text-end">
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                  className="d-inline-flex align-items-center"
                >
                  <FaPlus className="me-2" /> Add Request
                </Button>
              </Col>
            )}
            {userInfo?.role === "admin" && selectedProducts.length > 0 && (
              <Col className="text-end">
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  className="d-inline-flex align-items-center"
                >
                  <FaTrash className="me-2" /> Delete Selected
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
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Status</th>
                      {userInfo?.role === "admin" && <th>Select</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts?.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                        <td>
                          {editingQuantity === product.id ? (
                            <div className="d-flex align-items-center gap-2">
                              <Form.Control
                                type="number"
                                min="1"
                                value={tempQuantity}
                                onChange={(e) =>
                                  setTempQuantity(e.target.value)
                                }
                                size="sm"
                                style={{ width: "80px" }}
                                autoFocus
                              />
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleSaveEdit(product.id)}
                                className="p-1"
                              >
                                <FaCheck />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="p-1"
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <span>{product.quantity}</span>
                              {userInfo?.role !== "admin" && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() =>
                                    handleStartEdit(
                                      product.id,
                                      product.quantity
                                    )
                                  }
                                  className="p-1"
                                >
                                  <FaEdit />
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {userInfo?.role === "admin" ? (
                            <Form.Select
                              value={
                                inputStatuses[product.id] ?? product.status
                              }
                              onChange={(e) =>
                                setInputStatuses({
                                  ...inputStatuses,
                                  [product.id]: e.target.value,
                                })
                              }
                              onBlur={() => handleStatusChange(product.id)}
                              size="sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="purchased">Purchased</option>
                            </Form.Select>
                          ) : (
                            <Badge
                              bg={
                                product.status === "purchased"
                                  ? "success"
                                  : "warning"
                              }
                              className="text-capitalize"
                            >
                              {product.status}
                            </Badge>
                          )}
                        </td>
                        {userInfo?.role === "admin" && (
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination className="justify-content-center mt-4">
                  <Pagination.Prev
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages).keys()].map((number) => (
                    <Pagination.Item
                      key={number + 1}
                      active={number + 1 === currentPage}
                      onClick={() => setCurrentPage(number + 1)}
                    >
                      {number + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Requested Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
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
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestedProductsPage;
