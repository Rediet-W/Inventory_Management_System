import React, { useState, useEffect } from "react";
import {
  useGetShopProductsQuery,
  useUpdateProductInShopMutation,
  useDeleteProductMutation,
} from "../slices/shopApiSlice";
import {
  Tab,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Pagination,
  Alert,
} from "react-bootstrap";
import SearchBar from "../components/SearchBar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "../slices/refreshSlice";

const ShopPage = () => {
  const dispatch = useDispatch();
  const refreshKey = useSelector((state) => state.refresh.refreshKey);

  const { data, error, isLoading, refetch } = useGetShopProductsQuery({});
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateProductInShopMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("batchNumber"); // Default search type
  const [activeTab, setActiveTab] = useState("all");
  const { userInfo } = useSelector((state) => state.auth);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">Error loading products</Alert>;

  // Handle delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        alert("Product deleted successfully!");
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("❌ Failed to delete product", error);
        setErrorMessage(error.data?.message || "Failed to delete product");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      await updateProduct({
        id: editingProduct.id,
        updatedProduct: {
          name: editingProduct.name,
          batchNumber: editingProduct.batchNumber,
          sellingPrice: parseFloat(editingProduct.sellingPrice),
          quantity: parseFloat(editingProduct.quantity),
          unitOfMeasurement: editingProduct.unitOfMeasurement,
        },
      }).unwrap();

      alert("✅ Product updated successfully!");
      dispatch(triggerRefresh());
      setShowEditModal(false);
    } catch (error) {
      console.error("❌ Failed to update product", error);
      setErrorMessage(error.data?.message || "Failed to update product");
    }
  };

  // **Filter products based on search query**
  let filteredProducts = data?.allProducts || [];

  if (searchQuery.trim() !== "") {
    filteredProducts = filteredProducts.filter((product) => {
      if (searchType === "batchNumber") {
        return product.batchNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      } else {
        return product.name?.toLowerCase().includes(searchQuery.toLowerCase());
      }
    });
  }

  // **Low stock products based on `reorderLevel`**
  const lowStockProducts = filteredProducts.filter(
    (product) => product.quantity <= product.reorderLevel
  );

  // **Apply Tab Selection**
  const displayedProducts =
    activeTab === "all" ? filteredProducts : lowStockProducts;

  // **Pagination logic**
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = displayedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      <h3 className="text-center">የፍኖተ ጽድቅ ሰ/ት/ቤት የንዋየ ቅድሳት መሸጫ ሱቅ</h3>
      <h4 className="text-center">ቀን፡ {new Date().toLocaleDateString()}</h4>

      <Row className="align-items-center mt-4">
        <Col md={6}></Col>
        <Col md={6} className="text-end">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
          />
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={(tabKey) => setActiveTab(tabKey)}>
        <Tab eventKey="all" title="All Products">
          {renderTable(currentProducts, handleDelete, userInfo, handleEdit)}
        </Tab>
        <Tab eventKey="lowStock" title="Low Stock">
          {renderTable(currentProducts, handleDelete, userInfo, handleEdit)}
        </Tab>
      </Tabs>

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

      {/* Modal for editing product */}
      {editingProduct && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="productName">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="batchNumber">
                <Form.Label>Batch Number</Form.Label>
                <Form.Control
                  type="text"
                  value={editingProduct.batchNumber}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      batchNumber: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="sellingPrice">
                <Form.Label>Selling Price</Form.Label>
                <Form.Control
                  type="number"
                  value={editingProduct.sellingPrice}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      sellingPrice: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

const renderTable = (products, handleDelete, userInfo, handleEdit) => (
  <Table striped bordered hover responsive className="mt-3">
    <thead>
      <tr>
        <th>No.</th>
        <th>Batch No.</th>
        <th>Description</th>
        <th>UOM</th>
        <th>Quantity</th>
        <th>Selling Price</th>
      </tr>
    </thead>
    <tbody>
      {products.map((product, index) => (
        <tr key={product.id}>
          <td>{index + 1}</td>
          <td>{product.batchNumber}</td>
          <td>{product.name}</td>
          <td>{product.unitOfMeasurement}</td>
          <td>{product.quantity}</td>
          <td>{product.sellingPrice}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default ShopPage;
