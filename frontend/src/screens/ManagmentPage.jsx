import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Pagination,
  Alert,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import {
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../slices/productApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "../slices/refreshSlice";
import SearchBar from "../components/SearchBar";

const ManagementPage = () => {
  const dispatch = useDispatch();
  const refreshKey = useSelector((state) => state.refresh.refreshKey);
  const { data: products, isLoading, error, refetch } = useGetProductsQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("batchNumber");
  const [editedProducts, setEditedProducts] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">Error loading products</Alert>;

  // **Search Logic**
  let filteredProducts = products || [];
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

  // **Handle Input Changes & Validation**
  const handleChange = (productId, field, value) => {
    setEditedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));

    // **Validation for Selling Price & Remark**
    const product = products.find((p) => p.id === productId);
    if (field === "sellingPrice") {
      if (value < product.averageCost) {
        setValidationErrors((prev) => ({
          ...prev,
          [productId]:
            "Remark is required when selling price is lower than average cost.",
        }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[productId]; // Remove error if fixed
          return newErrors;
        });
      }
    }

    if (field === "remark") {
      if (
        editedProducts[productId]?.sellingPrice < product.averageCost &&
        value.trim() === ""
      ) {
        setValidationErrors((prev) => ({
          ...prev,
          [productId]:
            "Remark cannot be empty if selling price < average cost.",
        }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[productId];
          return newErrors;
        });
      }
    }
  };

  // **Save Updated Products**
  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage("❌ Cannot save: Fix validation errors first.");
      return;
    }

    try {
      const updates = Object.entries(editedProducts).map(([id, changes]) => ({
        id,
        ...changes,
      }));

      await Promise.all(
        updates.map((product) => updateProduct(product).unwrap())
      );

      alert("✅ Products updated successfully!");
      setEditedProducts({});
      setValidationErrors({});
      dispatch(triggerRefresh());
    } catch (error) {
      console.error("❌ Failed to update products", error);
      setErrorMessage("Failed to update products");
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="text-center ">Product Management</h3>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {/* Search Bar and Save Button in One Row */}
      <Row className="align-items-center mb-3 mt-5">
        <Col md={6}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
          />
        </Col>
        <Col md={4} className="text-end ">
          <Button
            variant="success"
            onClick={handleSave}
            disabled={isUpdating || Object.keys(validationErrors).length > 0}
            className=""
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </Col>
      </Row>

      {/* Product Table */}
      <Table striped bordered hover responsive className="table-sm mt-3">
        <thead>
          <tr>
            <th>No.</th>
            <th>Batch No</th>
            <th>Description</th>
            <th>UOM</th>
            <th>Quantity</th>
            <th>Reorder Level</th>
            <th>Average Cost</th>
            <th>Selling Price</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product, index) => {
            const isSellingBelowAverage =
              editedProducts[product.id]?.sellingPrice < product.averageCost;

            return (
              <tr key={product.id}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <Form.Control
                    type="text"
                    value={
                      editedProducts[product.id]?.batchNumber ??
                      product.batchNumber
                    }
                    onChange={(e) =>
                      handleChange(product.id, "batchNumber", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={editedProducts[product.id]?.name ?? product.name}
                    onChange={(e) =>
                      handleChange(product.id, "name", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={
                      editedProducts[product.id]?.unitOfMeasurement ??
                      product.unitOfMeasurement
                    }
                    onChange={(e) =>
                      handleChange(
                        product.id,
                        "unitOfMeasurement",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td>{product.quantity} </td>

                <td>
                  <Form.Control
                    type="number"
                    value={
                      editedProducts[product.id]?.reorderLevel ??
                      product.reorderLevel
                    }
                    onChange={(e) =>
                      handleChange(product.id, "reorderLevel", e.target.value)
                    }
                    min="0"
                  />
                </td>
                <td>{product.averageCost}</td>

                <td>
                  <Form.Control
                    type="number"
                    value={
                      editedProducts[product.id]?.sellingPrice ??
                      product.sellingPrice
                    }
                    onChange={(e) =>
                      handleChange(product.id, "sellingPrice", e.target.value)
                    }
                    min="0"
                  />
                  {validationErrors[product.id] && (
                    <small className="text-danger">
                      {validationErrors[product.id]}
                    </small>
                  )}
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={
                      editedProducts[product.id]?.remark ?? product.remark ?? ""
                    }
                    onChange={(e) =>
                      handleChange(product.id, "remark", e.target.value)
                    }
                    className={isSellingBelowAverage ? "border-danger" : ""}
                    placeholder={
                      isSellingBelowAverage ? "Required" : "Enter remark"
                    }
                  />
                </td>
              </tr>
            );
          })}
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

export default ManagementPage;
