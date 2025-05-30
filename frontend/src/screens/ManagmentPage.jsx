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
import { toast } from "react-toastify";

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

  if (isLoading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  if (error)
    return (
      <Alert variant="danger" className="text-center">
        Error loading products
      </Alert>
    );

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
      toast.error("Cannot save: Fix validation errors first.");
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

      toast.success("Products updated successfully!");
      setEditedProducts({});
      setValidationErrors({});
      dispatch(triggerRefresh());
    } catch (error) {
      console.error("Failed to update products", error);
      toast.error("Failed to update products");
    }
  };

  return (
    <div className="container mt-4">
      <div className="bg-white p-4 rounded-3 shadow-sm">
        <h3 className="text-center mb-4" style={{ color: "#1E43FA" }}>
          Product Management
        </h3>

        {/* Search Bar and Save Button in One Row */}
        <Row className="align-items-center mb-4">
          <Col md={8}>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchType={searchType}
              setSearchType={setSearchType}
            />
          </Col>
          <Col md={4} className="text-end">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isUpdating || Object.keys(validationErrors).length > 0}
              style={{ backgroundColor: "#1E43FA", borderColor: "#1E43FA" }}
            >
              {isUpdating ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Col>
        </Row>

        {/* Product Table */}
        <div className="table-responsive">
          <Table striped bordered hover className="mt-3">
            <thead className="table-light">
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
                  editedProducts[product.id]?.sellingPrice <
                  product.averageCost;

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
                          handleChange(
                            product.id,
                            "batchNumber",
                            e.target.value
                          )
                        }
                        className="form-control-sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={editedProducts[product.id]?.name ?? product.name}
                        onChange={(e) =>
                          handleChange(product.id, "name", e.target.value)
                        }
                        className="form-control-sm"
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
                        className="form-control-sm"
                      />
                    </td>
                    <td className="text-center">{product.quantity}</td>

                    <td>
                      <Form.Control
                        type="number"
                        value={
                          editedProducts[product.id]?.reorderLevel ??
                          product.reorderLevel
                        }
                        onChange={(e) =>
                          handleChange(
                            product.id,
                            "reorderLevel",
                            e.target.value
                          )
                        }
                        min="0"
                        className="form-control-sm"
                      />
                    </td>
                    <td className="text-center">{product.averageCost}</td>

                    <td>
                      <Form.Control
                        type="number"
                        value={
                          editedProducts[product.id]?.sellingPrice ??
                          product.sellingPrice
                        }
                        onChange={(e) =>
                          handleChange(
                            product.id,
                            "sellingPrice",
                            e.target.value
                          )
                        }
                        min="0"
                        className={`form-control-sm ${
                          validationErrors[product.id] ? "is-invalid" : ""
                        }`}
                      />
                      {validationErrors[product.id] && (
                        <div className="invalid-feedback">
                          {validationErrors[product.id]}
                        </div>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={
                          editedProducts[product.id]?.remark ??
                          product.remark ??
                          ""
                        }
                        onChange={(e) =>
                          handleChange(product.id, "remark", e.target.value)
                        }
                        className={`form-control-sm ${
                          isSellingBelowAverage ? "is-invalid" : ""
                        }`}
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="justify-content-center mt-4">
            <Pagination.Prev
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPage}
                onClick={() => handlePageChange(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            />
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default ManagementPage;
