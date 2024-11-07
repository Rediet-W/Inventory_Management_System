import React, { useState, useEffect } from "react";
import {
  useGetShopProductsQuery,
  useUpdateProductMutation,
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
} from "react-bootstrap";
import SearchBar from "../components/SearchBar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import { triggerRefresh } from "../slices/refreshSlice"; // Import refresh trigger

const ShopPage = () => {
  const dispatch = useDispatch();
  const refreshKey = useSelector((state) => state.refresh.refreshKey);
  const { data, error, isLoading, refetch } = useGetShopProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("product_name");
  const [activeTab, setActiveTab] = useState("all");
  const { userInfo } = useSelector((state) => state.auth);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    refetch(); // Re-fetch data on refreshKey change
  }, [refreshKey, refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  // Handle delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        alert("Product deleted successfully!");
        dispatch(triggerRefresh()); // Trigger refresh after deletion
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Failed to delete product");
      }
    }
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Handle save after editing
  const handleSave = async () => {
    try {
      await updateProduct({
        id: editingProduct.id,
        updatedProduct: editingProduct,
      }).unwrap();
      alert("Product updated successfully!");
      dispatch(triggerRefresh()); // Trigger refresh after update
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to update product", error);
    }
  };

  // Filter products based on search query
  const filteredProducts = (products) => {
    return products.filter((product) => {
      const searchField =
        searchType === "productName"
          ? product.product_name
          : product.batch_number;
      return searchField.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  // Sort products by date added (latest at top)
  const allProducts =
    data?.allProducts
      ?.slice()
      .sort((a, b) => new Date(b.date_added) - new Date(a.date_added)) || [];
  const lowStockProducts =
    data?.lowStockProducts
      ?.slice()
      .sort((a, b) => new Date(b.date_added) - new Date(a.date_added)) || [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts(
    activeTab === "all" ? allProducts : lowStockProducts
  ).slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    filteredProducts(activeTab === "all" ? allProducts : lowStockProducts)
      .length / itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <h2>Shop Products</h2>
        </Col>
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
            <Form.Group controlId="productName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={editingProduct.product_name}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    product_name: e.target.value,
                  })
                }
              />
            </Form.Group>
            {/* Additional fields for editing product */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

const renderTable = (products, handleDelete, userInfo, handleEdit) => {
  if (!products || products.length === 0) {
    return <div>No products available</div>;
  }

  return (
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr>
          <th>Date Added</th>
          <th>Product Name</th>
          <th>Batch Number</th>
          <th>Selling Price per unit</th>
          <th>Quantity Available</th>
          {userInfo?.role === "admin" && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{format(new Date(product.date_added), "dd/MM/yyyy")}</td>
            <td>{product.product_name}</td>
            <td>{product.batch_number}</td>
            <td>{product.selling_price}</td>
            <td>{product.quantity}</td>
            {userInfo?.role === "admin" && (
              <td>
                <FaEdit
                  style={{ cursor: "pointer", color: "green" }}
                  onClick={() => handleEdit(product)}
                />
                <FaTrash
                  style={{
                    cursor: "pointer",
                    color: "red",
                    marginLeft: "10px",
                  }}
                  onClick={() => handleDelete(product.id)}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ShopPage;
