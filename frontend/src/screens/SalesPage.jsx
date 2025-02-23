import React, { useState, useEffect, useMemo } from "react";
import {
  useGetSalesByDateQuery,
  useAddSaleMutation,
  useDeleteSaleMutation,
  useEditSaleMutation,
} from "../slices/salesApiSlice";
import { useGetShopProductsQuery } from "../slices/shopApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "../slices/refreshSlice";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Alert,
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: shopProducts = { allProducts: [] } } =
    useGetShopProductsQuery();
  const { data: sales = [], refetch } = useGetSalesByDateQuery(saleDate, {
    skip: !saleDate,
  });

  const [addSale] = useAddSaleMutation();
  const [deleteSale] = useDeleteSaleMutation();
  const [editSale] = useEditSaleMutation();

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  const handleAddSale = async () => {
    setErrorMessage("");

    if (!selectedProduct) {
      setErrorMessage("Please select a product.");
      return;
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setErrorMessage("Quantity must be greater than 0.");
      return;
    }

    const productExists = shopProducts.allProducts.some(
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
        `Can't sell more than available in shop (${selectedProduct.quantity} units).`
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
      dispatch(triggerRefresh());
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      setErrorMessage(error?.data?.message || "Error adding sale");
    }
  };

  const handleEdit = (sale) => {
    const newQuantity = prompt(
      "Enter new quantity for the sale:",
      sale.quantity_sold
    );
    if (newQuantity && !isNaN(newQuantity) && newQuantity > 0) {
      editSale({ saleId: sale.id, saleData: { quantitySold: newQuantity } })
        .unwrap()
        .then(() => {
          alert("Sale updated successfully");
          dispatch(triggerRefresh());
        })
        .catch(() => alert("Error updating sale"));
    }
  };

  const handleDelete = async (saleId) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await deleteSale(saleId).unwrap();
        alert("Sale deleted successfully");
        dispatch(triggerRefresh());
      } catch (error) {
        alert("Error deleting sale");
      }
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchResults([]);

    if (searchValue.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = shopProducts?.allProducts?.filter((product) =>
      product.product_name.toLowerCase().includes(searchValue)
    );

    setSearchResults(results);
  };
  useEffect(() => {
    setSelectedProduct(null);
  }, [searchResults]);

  const totalSalesETB = useMemo(() => {
    return sales?.reduce(
      (total, sale) => total + sale.selling_price * sale.quantity_sold,
      0
    );
  }, [sales]);

  const sortedSales = sales
    ?.slice()
    .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = sortedSales?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((sortedSales?.length || 0) / itemsPerPage);

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

      {userInfo?.role == "user" && (
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

                {!selectedProduct &&
                  searchResults?.map((product) => (
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
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </Form.Group>

                    <Button
                      className="w-100"
                      variant="primary"
                      onClick={handleAddSale}
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
    </Container>
  );
};

export default SalesPage;
