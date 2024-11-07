import React, { useState, useEffect, useMemo } from "react";
import {
  useGetSalesByDateQuery,
  useAddSaleMutation,
  useDeleteSaleMutation,
  useEditSaleMutation,
} from "../slices/salesApiSlice";
import { useGetShopProductsQuery } from "../slices/shopApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "../slices/refreshSlice"; // Import refresh trigger
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Alert,
  Modal,
  Pagination,
} from "react-bootstrap";
import { format } from "date-fns";

const SalesPage = () => {
  const dispatch = useDispatch();
  const refreshKey = useSelector((state) => state.refresh.refreshKey);
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showShopModal, setShowShopModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all products from the shop
  const { data: shopProducts } = useGetShopProductsQuery();

  // Fetch sales for the specific date, refetch when refreshKey changes
  const { data: sales, refetch } = useGetSalesByDateQuery(saleDate);

  const [addSale] = useAddSaleMutation();
  const [deleteSale] = useDeleteSaleMutation();
  const [editSale] = useEditSaleMutation();

  // Re-fetch sales data whenever refreshKey changes
  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  // Handle adding sale
  const handleAddSale = async () => {
    setErrorMessage("");
    if (!selectedProduct || quantity <= 0) return;

    const productExists = shopProducts?.allProducts?.some(
      (product) => product.id === selectedProduct.id
    );

    if (!productExists) {
      setErrorMessage(
        "The selected product is no longer available in the shop."
      );
      return;
    }

    if (quantity > selectedProduct.quantity) {
      setErrorMessage(
        `Cannot sell more than available in stock. Available: ${selectedProduct.quantity}`
      );
      return;
    }

    try {
      await addSale({
        product_id: selectedProduct.id,
        quantity_sold: quantity,
        user_name: userInfo?.name,
      }).unwrap();
      alert("Sale added successfully");
      dispatch(triggerRefresh()); // Trigger global refresh
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      setErrorMessage(error?.data?.message || "Error adding sale");
    }
  };

  // Handle editing sale
  const handleEdit = (sale) => {
    const newQuantity = prompt(
      "Enter new quantity for the sale:",
      sale.quantity_sold
    );
    if (newQuantity && newQuantity > 0) {
      editSale({
        saleId: sale.id,
        saleData: { quantitySold: newQuantity },
      })
        .unwrap()
        .then(() => {
          alert("Sale updated successfully");
          dispatch(triggerRefresh()); // Trigger global refresh
        })
        .catch((error) => alert("Error updating sale"));
    }
  };

  // Handle deleting sale
  const handleDelete = async (saleId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale? This action cannot be undone and the sale will not be added back to the shop."
    );

    if (confirmDelete) {
      try {
        await deleteSale(saleId).unwrap();
        alert("Sale deleted successfully");
        dispatch(triggerRefresh()); // Trigger global refresh
      } catch (error) {
        alert("Error deleting sale");
      }
    }
  };

  // Handle product search
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const results = shopProducts?.allProducts?.filter((product) =>
      product.product_name.toLowerCase().includes(searchValue)
    );
    setSearchResults(results);
  };

  // Calculate total sales for the selected date
  const totalSalesETB = useMemo(() => {
    return sales?.reduce(
      (total, sale) => total + sale.selling_price * sale.quantity_sold,
      0
    );
  }, [sales]);

  // Sort and paginate sales data
  const sortedSales = sales
    ?.slice()
    .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = sortedSales?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((sortedSales?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Sales Page</h1>

      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Sales Summary</Card.Title>
              <Card.Text>
                Date:{" "}
                <strong>{format(new Date(saleDate), "dd/MM/yyyy")}</strong>
              </Card.Text>
              <Card.Text>
                Total Sales:{" "}
                <strong>
                  {totalSalesETB ? `${totalSalesETB} ETB` : "No sales yet"}
                </strong>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {userInfo?.role !== "admin" && (
        <Row className="justify-content-center mb-4">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <h2 className="text-center mb-4">Add Sale</h2>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Search product by name"
                    onChange={handleSearch}
                  />
                </Form.Group>

                {/* Display search results */}
                {searchResults?.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid #ddd",
                      padding: "5px",
                    }}
                  >
                    {product.product_name}
                  </div>
                ))}

                {selectedProduct && (
                  <div className="selected-product-info mt-3">
                    <p>
                      <strong>Selected Product:</strong>{" "}
                      {selectedProduct?.product_name}
                    </p>
                    <p>
                      <strong>Available Stock:</strong>{" "}
                      {selectedProduct?.quantity} units
                    </p>
                    <p>
                      <strong>Selling Price:</strong>{" "}
                      {selectedProduct?.selling_price} ETB
                    </p>
                    <Form.Group controlId="quantity" className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={selectedProduct.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </Form.Group>

                    {quantity > selectedProduct.quantity && (
                      <Alert variant="warning">
                        Quantity entered exceeds available stock (
                        {selectedProduct.quantity} units available).
                      </Alert>
                    )}

                    <Button
                      className="w-100"
                      variant="primary"
                      onClick={handleAddSale}
                      disabled={quantity > selectedProduct.quantity}
                    >
                      Add Sale
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Form.Group className="text-center">
            <Form.Label>Select Date</Form.Label>
            <Form.Control
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="text-center"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={10}>
          <Table striped bordered hover className="shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Product Name</th>
                <th>Quantity Sold</th>
                <th>Selling Price per unit</th>
                {userInfo?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {!sales ? (
                <tr>
                  <td
                    colSpan={userInfo?.role === "admin" ? 5 : 4}
                    className="text-center"
                  >
                    Please select a date to view sales.
                  </td>
                </tr>
              ) : currentSales.length === 0 ? (
                <tr>
                  <td
                    colSpan={userInfo?.role === "admin" ? 5 : 4}
                    className="text-center"
                  >
                    No sales available for the selected date.
                  </td>
                </tr>
              ) : (
                currentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{format(new Date(sale.sale_date), "dd/MM/yyyy")}</td>
                    <td>{sale?.product_name}</td>
                    <td>{sale?.quantity_sold}</td>
                    <td>{sale?.selling_price} ETB</td>
                    {userInfo?.role === "admin" && (
                      <td>
                        <Button
                          variant="warning"
                          className="btn-sm me-2"
                          onClick={() => handleEdit(sale)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          className="btn-sm"
                          onClick={() => handleDelete(sale.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
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
        </Col>
      </Row>

      {/* <Button variant="link" onClick={() => setShowShopModal(true)}>
        View Shop Products
      </Button>

      <Modal show={showShopModal} onHide={() => setShowShopModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Shop Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Available Stock</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {shopProducts?.allProducts?.map((product) => (
                <tr key={product.id}>
                  <td>{product.product_name}</td>
                  <td>{product.quantity}</td>
                  <td>{product.selling_price} ETB</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal> */}
    </Container>
  );
};

export default SalesPage;
