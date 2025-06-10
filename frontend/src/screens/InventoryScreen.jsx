import React, { useState, useEffect } from "react";
import {
  Table,
  Nav,
  Pagination,
  Row,
  Col,
  Spinner,
  Modal,
  Form,
  Button,
} from "react-bootstrap";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../slices/productApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "../slices/refreshSlice";
import SearchBar from "../components/SearchBar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCreateAdjustmentMutation } from "../slices/adjustmentApiSlice";

const InventoryPage = () => {
  const dispatch = useDispatch();
  const refreshKey = useSelector((state) => state.refresh.refreshKey);
  const { data: products, isLoading, error, refetch } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("batchNumber");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  // for adjustments
  const { userInfo } = useSelector((state) => state.auth);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [createAdjustment, { isLoading: isCreating }] =
    useCreateAdjustmentMutation();

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  const handleDeleteProduct = async (productId) => {
    try {
      const result = await new Promise((resolve) => {
        toast.info(
          <div>
            <p>Are you sure you want to delete this product?</p>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <button
                className="btn btn-sm btn-outline-danger"
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
        await deleteProduct(productId).unwrap();
        toast.success("Product deleted successfully");
        dispatch(triggerRefresh());
      }
    } catch (error) {
      toast.error("Failed to delete product");
      console.error("Failed to delete product", error);
    }
  };

  // Filtering logic remains the same
  let filteredProducts = products || [];
  if (filter === "lowStock") {
    filteredProducts = filteredProducts.filter(
      (product) => product.quantity <= product.reorderLevel
    );
  }
  if (searchQuery.trim() !== "") {
    filteredProducts = filteredProducts.filter((product) => {
      if (searchType === "batchNumber") {
        return product.batchNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      } else {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
    });
  }

  const sortedProducts = [...filteredProducts].sort(
    (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  if (isLoading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error) {
    toast.error("Error loading products");
    return null;
  }

  return (
    <div className="container-fluid p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-center mb-2">
            የፍኖተ ጽድቅ ሰ/ት/ቤት የንዋየ ቅድሳት መሸጫ ሱቅ
          </h3>
          <h5 className="text-center text-muted mb-4">
            ቀን፡ {new Date().toLocaleDateString()}
          </h5>

          {/* Filter & Search */}
          <Row className="align-items-center mb-4 g-3">
            <Col md={8}>
              <Nav variant="pills">
                <Nav.Item>
                  <Nav.Link
                    active={filter === "all"}
                    onClick={() => setFilter("all")}
                    className="rounded-pill me-2"
                  >
                    All Products
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={filter === "lowStock"}
                    onClick={() => setFilter("lowStock")}
                    className="rounded-pill"
                  >
                    Low Stock
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col md={4}>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchType={searchType}
                setSearchType={setSearchType}
              />
            </Col>
          </Row>

          {/* Product Table */}
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Batch No.</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th>Qty</th>
                  <th>Avg Cost</th>
                  <th>Total Cost</th>
                  <th>Actions</th>
                  {(userInfo?.role === "admin" ||
                    userInfo?.role === "superadmin") && <th>Adjust</th>}
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{product.batchNumber}</td>
                    <td>{product.name}</td>
                    <td>{product.unitOfMeasurement}</td>
                    <td
                      className={
                        product.quantity <= product.reorderLevel
                          ? "text-danger fw-bold"
                          : ""
                      }
                    >
                      {product.quantity}
                    </td>
                    <td>{Number(product.averageCost).toFixed(2)}</td>
                    <td>{Number(product.totalCost).toFixed(2)}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={isDeleting}
                        className="rounded-circle"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                    {userInfo?.role === "admin" && (
                      <td>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setNewQuantity(product.quantity);
                            setReason("");
                            setShowAdjustModal(true);
                          }}
                        >
                          Adjust
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-4">
              <Pagination.Prev
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
        </div>
      </div>
      <Modal
        show={showAdjustModal}
        onHide={() => setShowAdjustModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Request Inventory Adjustment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Product:</strong> {selectedProduct?.name}
          </p>
          <p>
            <strong>Batch:</strong> {selectedProduct?.batchNumber}
          </p>
          <p>
            <strong>Current Qty:</strong> {selectedProduct?.quantity}
          </p>
          <Form.Group controlId="newQty" className="mb-3">
            <Form.Label>New Quantity</Form.Label>
            <Form.Control
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder="Enter corrected quantity"
              min="0"
            />
          </Form.Group>
          <Form.Group controlId="reason">
            <Form.Label>Reason for Adjustment</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the adjustment is needed"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdjustModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              if (!newQuantity || !reason) {
                toast.error("Please fill all fields.");
                return;
              }
              try {
                await createAdjustment({
                  type: "purchase",
                  batchNumber: selectedProduct.batchNumber,
                  oldQuantity: selectedProduct.quantity,
                  quantity: parseInt(newQuantity),
                  reason,
                  requestedBy: userInfo.name,
                  mode: userInfo.isPrimaryAdmin ? "direct" : "requested",
                }).unwrap();
                toast.success("Adjustment request submitted.");
                setShowAdjustModal(false);
              } catch (err) {
                toast.error("Failed to submit adjustment.");
              }
            }}
            disabled={isCreating}
          >
            {isCreating ? "Submitting..." : "Submit Request"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InventoryPage;
