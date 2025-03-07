import React, { useState, useEffect } from "react";
import { Table, Nav, Pagination, Alert, Row, Col } from "react-bootstrap";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../slices/productApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "../slices/refreshSlice";
import SearchBar from "../components/SearchBar";

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

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">Error loading products</Alert>;

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId).unwrap();
        alert("✅ Product deleted successfully");
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("❌ Failed to delete product", error);
      }
    }
  };

  // **🔹 Reverted Search Logic (Filter Instead of API Call)**
  let filteredProducts = products || [];

  // **Filter by Low Stock**
  if (filter === "lowStock") {
    filteredProducts = filteredProducts.filter(
      (product) => product.quantity <= product.reorderLevel
    );
  }

  // **Search Filter**
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

  // **Sort (Avoid Immutable Sort Error)**
  const sortedProducts = [...filteredProducts].sort(
    (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
  );

  // **Pagination**
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-5">
      <h3 className="text-center">የፍኖተ ጽድቅ ሰ/ት/ቤት የንዋየ ቅድሳት መሸጫ ሱቅ</h3>
      <h4 className="text-center">ቀን፡ {new Date().toLocaleDateString()}</h4>

      {/* Filter & Search */}
      <Row className="align-items-center mb-4">
        <Col md={8}>
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All Products
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={filter === "lowStock"}
                onClick={() => setFilter("lowStock")}
              >
                Low Stock
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col md={4} className="mt-3 mt-md-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
          />
        </Col>
      </Row>

      {/* Product Table */}
      <Table striped bordered hover responsive className="table-sm mt-3">
        <thead>
          <tr>
            <th>No.</th>
            <th>Batch No.</th>
            <th>Description</th>
            <th>UOM</th>
            <th>Qty</th>
            <th>Average Cost</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product, index) => (
            <tr key={product.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{product.batchNumber}</td>
              <td>{product.name}</td>
              <td>{product.unitOfMeasurement}</td>
              <td>{product.quantity}</td>
              <td>{product.averageCost}</td>
              <td>{product.totalCost}</td>
            </tr>
          ))}
        </tbody>
      </Table>

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
    </div>
  );
};

export default InventoryPage;
