import React, { useState, useEffect } from "react";
import { Table, Button, Row, Col, Form, Alert } from "react-bootstrap";
import { useGetShopProductsQuery } from "../slices/shopApiSlice";
import { useAddSaleMutation } from "../slices/salesApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import { useSelector, useDispatch } from "react-redux";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const SalesPage = () => {
  const dispatch = useDispatch();
  const { data: shopData, isLoading, error } = useGetShopProductsQuery();
  const [addSale, { isLoading: isSubmitting }] = useAddSaleMutation();

  const [sales, setSales] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);
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
      setErrorMessage(
        "❌ Ensure sale quantity is valid and does not exceed available stock."
      );
      setTimeout(() => setErrorMessage(null), 5000);
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

      alert("✅ Sales recorded successfully!");
      dispatch(triggerRefresh());
      setSales([]);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("❌ Failed to record sales.");
    }
  };

  const handleDownload = () => {
    const exportData = sales.map((s) => ({
      "No.": sales.indexOf(s) + 1,
      Product: s.product,
      "Batch No.": s.batchNumber,
      UOM: s.unitOfMeasurement,
      "Selling Price": s.sellingPrice,
      "Qty in Store": s.qty,
      "Qty Sold": s.quantitySold,
      "Total Selling Price": s.totalSellingPrice,
      Cashier: userInfo.name,
      Date: date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "Sales.xlsx");
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">Error loading products</Alert>;

  return (
    <div className="container mt-5">
      <h3 className="text-center">Sales Entry</h3>
      <h4 className="text-center">Date: {date}</h4>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Row className="mb-3 mt-3">
        <Col md={9}>
          <Button variant="primary" onClick={handleAddRow}>
            + Add Row
          </Button>
        </Col>
        <Col md={3} className="text-end">
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit Sales"}
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="table-sm mt-3">
        <thead>
          <tr>
            <th>No.</th>
            <th>Product</th>
            <th>Batch No.</th>
            <th>UOM</th>
            <th>Selling Price per unit</th>
            <th>Qty in Store</th>
            <th>Qty Sold</th>
            <th>Total Selling Price</th>
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
                  onChange={(e) => handleProductSelect(sale.id, e.target.value)}
                  style={{ fontSize: "0.9rem" }}
                >
                  <option value="">Select Product</option>
                  {shopData.allProducts.map((product) => (
                    <option key={product.batchNumber} value={product.name}>
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
                />
              </td>
              <td>{sale.totalSellingPrice}</td>
              <td>
                <Button
                  className="bg-transparent "
                  size="sm"
                  onClick={() => handleRemoveRow(sale.id)}
                >
                  ❌
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SalesPage;
