import React, { useState, useEffect } from "react";
import {
  Tab,
  Tabs,
  Table,
  Button,
  Alert,
  Form,
  Spinner,
  Pagination,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import {
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../slices/productApiSlice";
import { useGetSaleUnitsQuery } from "../slices/salesunitApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "../slices/refreshSlice";
import SearchBar from "../components/SearchBar";
import { toast } from "react-toastify";
import SalesUnitsModal from "../components/SalesUnitModal";

const ManagementPage = () => {
  const dispatch = useDispatch();
  const { data: products, isLoading, error, refetch } = useGetProductsQuery();
  const [updateProduct] = useUpdateProductMutation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSalesUnitsModal, setShowSalesUnitsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [editedProducts, setEditedProducts] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("batchNumber");

  useEffect(() => {
    refetch();
  }, [dispatch, refetch]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter products based on search
  const filteredProducts =
    products?.filter((product) =>
      searchQuery.trim() === ""
        ? true
        : searchType === "batchNumber"
        ? product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
        : product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const openSalesUnitsModal = (product) => {
    setSelectedProduct(product);
    setShowSalesUnitsModal(true);
  };

  const handleChange = (productId, field, value) => {
    const updatedProduct = {
      ...editedProducts[productId],
      [field]:
        field === "sellingPrice" || field === "reorderLevel"
          ? Number(value)
          : value,
    };

    setEditedProducts((prev) => ({ ...prev, [productId]: updatedProduct }));

    // Validation logic
    const product = products.find((p) => p.id === productId);
    if (field === "sellingPrice") {
      if (value < product.averageCost) {
        setValidationErrors((prev) => ({
          ...prev,
          [productId]:
            "Remark is required when selling price is lower than average cost",
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
  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    try {
      await Promise.all(
        Object.entries(editedProducts).map(([id, changes]) =>
          updateProduct({ id, ...changes }).unwrap()
        )
      );
      toast.success("Changes saved successfully");
      setEditedProducts({});
      setValidationErrors({});
      dispatch(triggerRefresh());
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };
  const ProductUnitRow = ({
    product,
    index,
    indexOfFirstItem,
    openSalesUnitsModal,
  }) => {
    const { data: unitsData } = useGetSaleUnitsQuery(product.id, {
      skip: !product.id,
    });

    return (
      <tr key={product.id}>
        <td>{indexOfFirstItem + index + 1}</td>
        <td>{product.batchNumber}</td>
        <td>{product.name}</td>
        <td>{product.unitOfMeasurement || "Not set"}</td>
        <td>{unitsData?.data?.length || 0}</td>
        <td>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => openSalesUnitsModal(product)}
          >
            Configure Units
          </Button>
        </td>
      </tr>
    );
  };
  if (isLoading)
    return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error)
    return (
      <Alert variant="danger" className="text-center">
        Error loading products
      </Alert>
    );

  return (
    <div className="container-fluid py-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-3">Product Management</h3>

          {/* Save button at the top */}
          <Row className="mb-3">
            <Col className="text-end">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={Object.keys(editedProducts).length === 0}
              >
                Save All Changes
              </Button>
            </Col>

            {/* Search bar */}
            <Col>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchType={searchType}
                setSearchType={setSearchType}
              />
            </Col>
          </Row>

          <Tabs
            activeKey={activeTab}
            onSelect={setActiveTab}
            className="mb-3 nav-tabs"
          >
            <Tab eventKey="inventory" title="Inventory">
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Batch No</th>
                      <th>Description</th>
                      <th>UOM</th>
                      <th>Quantity</th>
                      <th>Reorder Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((product, index) => (
                      <tr key={product.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={
                              editedProducts[product.id]?.batchNumber ||
                              product.batchNumber
                            }
                            onChange={(e) =>
                              handleChange(
                                product.id,
                                "batchNumber",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={
                              editedProducts[product.id]?.name || product.name
                            }
                            onChange={(e) =>
                              handleChange(product.id, "name", e.target.value)
                            }
                          />
                        </td>
                        <td>{product.unitOfMeasurement || "N/A"}</td>
                        <td className="text-center">{product.quantity}</td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
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
                          />
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openSalesUnitsModal(product)}
                          >
                            Manage Units
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>

            <Tab eventKey="pricing" title="Pricing">
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Average Cost</th>
                      <th>Current Selling Price</th>
                      <th>New Selling Price</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((product, index) => (
                      <tr key={product.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{product.name}</td>
                        <td>{product.averageCost}</td>
                        <td>{product.sellingPrice}</td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
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
                            className={
                              validationErrors[product.id] ? "is-invalid" : ""
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            as="textarea"
                            rows={1}
                            size="sm"
                            value={
                              editedProducts[product.id]?.remark ??
                              product.remark ??
                              ""
                            }
                            onChange={(e) =>
                              handleChange(product.id, "remark", e.target.value)
                            }
                            placeholder={
                              (editedProducts[product.id]?.sellingPrice ??
                                product.sellingPrice) < product.averageCost
                                ? "Required"
                                : "Optional"
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>

            <Tab eventKey="units" title="Units">
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Batch No</th>
                      <th>Product</th>
                      <th>Base Unit</th>
                      <th>Available Units</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((product, index) => (
                      <ProductUnitRow
                        key={product.id}
                        product={product}
                        index={index}
                        indexOfFirstItem={indexOfFirstItem}
                        openSalesUnitsModal={openSalesUnitsModal}
                      />
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}

          {showSalesUnitsModal && (
            <SalesUnitsModal
              show={showSalesUnitsModal}
              onClose={() => setShowSalesUnitsModal(false)}
              product={selectedProduct}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ManagementPage;
