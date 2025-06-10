import React, { useState, useEffect } from "react";
import { Table, Button, Row, Col, Form, Spinner } from "react-bootstrap";
import { useGetShopProductsQuery } from "../slices/shopApiSlice";
import { useAddSaleMutation } from "../slices/salesApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SalesPage = () => {
  const dispatch = useDispatch();
  const { data: shopData, isLoading, error } = useGetShopProductsQuery();
  const [addSale, { isLoading: isSubmitting }] = useAddSaleMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [sales, setSales] = useState([]);
  const [date] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (shopData?.allProducts?.length > 0) {
      setSales([
        {
          id: Date.now(),
          product: "",
          batchNumber: "",
          unitOfMeasurement: "",
          sellingPrice: "",
          qty: 0,
          quantitySold: "",
          totalSellingPrice: "",
        },
      ]);
    }
  }, [shopData]);

  const handleAddRow = () => {
    setSales([
      ...sales,
      {
        id: Date.now(),
        product: "",
        batchNumber: "",
        unitOfMeasurement: "",
        sellingPrice: "",
        qty: 0,
        quantitySold: "",
        totalSellingPrice: "",
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    setSales(sales.filter((sale) => sale.id !== id));
  };

  const handleProductSelect = (id, selectedProduct) => {
    const product = shopData.allProducts.find(
      (p) => p.name === selectedProduct
    );
    setSales((prev) =>
      prev.map((sale) =>
        sale.id === id
          ? {
              ...sale,
              product: selectedProduct,
              batchNumber: product.batchNumber,
              unitOfMeasurement: product.unitOfMeasurement,
              sellingPrice: product.sellingPrice,
              qty: product.quantity,
              quantitySold: "",
              totalSellingPrice: "",
            }
          : sale
      )
    );
  };

  const handleQuantityChange = (id, value) => {
    setSales((prev) =>
      prev.map((sale) =>
        sale.id === id
          ? {
              ...sale,
              quantitySold: value,
              totalSellingPrice: value * sale.sellingPrice || 0,
            }
          : sale
      )
    );
  };

  const handleSubmit = async () => {
    const invalidSales = sales.filter(
      (s) => s.quantitySold > s.qty || s.quantitySold <= 0
    );
    if (invalidSales.length > 0) {
      toast.error(
        "Ensure sale quantity is valid and does not exceed available stock.",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
      return;
    }

    try {
      await Promise.all(
        sales.map((sale) =>
          addSale({
            name: sale.product,
            batchNumber: sale.batchNumber,
            unitOfMeasurement: sale.unitOfMeasurement,
            sellingPrice: sale.sellingPrice,
            quantity: Number(sale.quantitySold),
            reference: "Sale",
            seller: userInfo.name,
          }).unwrap()
        )
      );

      toast.success("Sales recorded successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
      dispatch(triggerRefresh());
      setSales([]);
    } catch (error) {
      toast.error("Failed to record sales", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  if (isLoading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger mt-4">Error loading products</div>
    );

  return (
    <div className="container-fluid p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="mb-0" style={{ color: "#1E43FA" }}>
            Sales Entry
          </h3>
          <h5 className="text-center text-muted mb-4">Date: {date}</h5>

          <Row className="mb-4">
            <Col md={9}>
              <Button
                variant="outline-primary"
                onClick={handleAddRow}
                className="rounded-pill px-4"
              >
                + Add Row
              </Button>
            </Col>
            <Col md={3} className="text-end">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-pill px-4"
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" />{" "}
                    Processing...
                  </>
                ) : (
                  "Submit Sales"
                )}
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Batch No.</th>
                  <th>UOM</th>
                  <th>Unit Price</th>
                  <th>In Stock</th>
                  <th>Qty Sold</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={sale.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Select
                        value={sale.product}
                        onChange={(e) =>
                          handleProductSelect(sale.id, e.target.value)
                        }
                        className="form-select-sm"
                      >
                        <option value="">Select Product</option>
                        {shopData.allProducts.map((product) => (
                          <option
                            key={product.batchNumber}
                            value={product.name}
                          >
                            {product.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>{sale.batchNumber}</td>
                    <td>{sale.unitOfMeasurement}</td>
                    <td>{sale.sellingPrice}</td>
                    <td>{sale.qty}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={sale.quantitySold}
                        onChange={(e) =>
                          handleQuantityChange(sale.id, e.target.value)
                        }
                        min="1"
                        max={sale.qty}
                        className="form-control-sm"
                      />
                    </td>
                    <td>{sale.totalSellingPrice}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveRow(sale.id)}
                        className="rounded-circle"
                      >
                        <i className="bi bi-x"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
