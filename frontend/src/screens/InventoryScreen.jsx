import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Nav,
  Form,
  Row,
  Col,
  Pagination,
  Alert,
} from "react-bootstrap";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../slices/productApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { useAddToShopMutation } from "../slices/shopApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import SearchBar from "../components/SearchBar";

const InventoryPage = () => {
  const dispatch = useDispatch();
  const refreshKey = useSelector((state) => state.refresh.refreshKey);
  const { data: products, isLoading, error, refetch } = useGetProductsQuery();
  const { userInfo } = useSelector((state) => state.auth);

  const [addToShop, { isLoading: isAdding }] = useAddToShopMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("productName");
  const [quantities, setQuantities] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">Error loading products</Alert>;

  const handleQuantityChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: value });
  };

  const handleAddToShop = async (productId) => {
    const quantityToAdd = quantities[productId];
    const product = products.find((product) => product.id === productId);

    // ✅ Check if required fields are present before making the request
    if (!product?.name) {
      setErrorMessage("Product name is required.");
      return;
    }
    if (!product?.buyingPrice || isNaN(Number(product.buyingPrice))) {
      setErrorMessage("Buying price must be a valid number.");
      return;
    }
    if (!quantityToAdd || quantityToAdd <= 0) {
      setErrorMessage("Please enter a valid quantity.");
      return;
    }
    if (quantityToAdd > product.quantity) {
      setErrorMessage(
        `Cannot add more than available quantity. Available: ${product.quantity}`
      );
      return;
    }

    try {
      await addToShop({
        productId,
        name: product.name,
        batchNumber: product.batchNumber,
        quantity: parseInt(quantityToAdd, 10),
        buyingPrice: parseFloat(product.buyingPrice),
        sellingPrice: parseFloat(product.sellingPrice),
        userName: userInfo?.name,
      }).unwrap();

      alert(`✅ Added ${quantityToAdd} units of ${product.name} to shop`);
      setQuantities((prev) => ({
        ...prev,
        [productId]: "", // Reset to empty string
      }));
      dispatch(triggerRefresh());
    } catch (error) {
      console.error("❌ Failed to add product to shop", error);
      setErrorMessage(error.data?.message || "Failed to add product to shop");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId).unwrap();
        alert("✅ Product deleted successfully");
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("❌ Failed to delete product", error);
        setErrorMessage(error.data?.message || "Failed to delete product");
      }
    }
  };

  // Filter and sort products
  const filteredProducts = products
    ?.filter((product) => {
      const matchesSearchQuery =
        searchType === "productName"
          ? product.name?.toLowerCase().includes(searchQuery.toLowerCase())
          : product.batchNumber
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase());

      const matchesLowStock =
        filter === "lowStock" ? product.quantity < 3 : true;
      return matchesSearchQuery && matchesLowStock;
    })
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-5">
      <h2>{filter === "all" ? "All Products" : "Low Stock Products"}</h2>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

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

      <Table striped bordered hover responsive className="table-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Batch Number</th>
            <th>Quantity</th>
            <th>Selling Price</th>
            {userInfo?.role === "admin" && <th>Buying Price</th>}
            {userInfo?.role === "admin" && <th>Select Quantity</th>}
            {userInfo?.role === "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {currentProducts?.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.batchNumber}</td>
              <td>{product.quantity}</td>
              <td>{product.sellingPrice}</td>
              {userInfo?.role === "admin" && <td>{product.buyingPrice}</td>}
              {userInfo?.role === "admin" && (
                <>
                  <td>
                    <Form.Control
                      type="number"
                      value={quantities[product.id] || ""}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      placeholder="Quantity"
                      min="1"
                    />
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      className="btn-sm"
                      onClick={() => handleAddToShop(product.id)}
                      disabled={isAdding}
                    >
                      {isAdding ? "Adding..." : "Add to Shop"}
                    </Button>
                    <Button
                      variant="danger"
                      className="btn-sm ml-2"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

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
    </div>
  );
};

export default InventoryPage;
