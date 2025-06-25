import React, { useState, useEffect } from "react";
import { Table, Button, Row, Col, Form, Spinner } from "react-bootstrap";
import { useGetShopProductsQuery } from "../slices/shopApiSlice";
import { useAddSaleMutation } from "../slices/salesApiSlice";
import { useLazyGetSaleUnitsQuery } from "../slices/salesunitApiSlice";
import { triggerRefresh } from "../slices/refreshSlice";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLazyGetProductByBatchNumberQuery } from "../slices/productApiSlice";
import "react-toastify/dist/ReactToastify.css";

const SalesPage = () => {
  const dispatch = useDispatch();
  const { data: shopData, isLoading, error } = useGetShopProductsQuery();
  const [addSale, { isLoading: isSubmitting }] = useAddSaleMutation();
  const [triggerGetUnits, { data: saleUnitsData, error: unitsError }] =
    useLazyGetSaleUnitsQuery();
  const [triggerGetProductByBatchNumber] =
    useLazyGetProductByBatchNumberQuery();
  useEffect(() => {
    if (unitsError) {
      console.error("Error fetching sale units:", unitsError);
    }
  }, [unitsError]);

  const { userInfo } = useSelector((state) => state.auth);

  const [sales, setSales] = useState([]);
  const [date] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (shopData?.allProducts?.length > 0) {
      setSales([createEmptyRow()]);
    }
  }, [shopData]);

  const createEmptyRow = () => ({
    id: Date.now(),
    product: "",
    batchNumber: "",
    qty: 0,
    quantitySold: "",
    totalSellingPrice: "",
    availableUnits: [],
    selectedUOM: "",
    sellingPrice: 0,
    unitQuantity: 1,
  });

  const handleAddRow = () => {
    setSales([...sales, createEmptyRow()]);
  };

  const handleRemoveRow = (id) => {
    setSales(sales.filter((sale) => sale.id !== id));
  };

  const handleProductSelect = async (id, selectedProductName) => {
    const product = shopData.allProducts.find(
      (p) => p.name === selectedProductName
    );
    if (!product) return;
    const togetid = await triggerGetProductByBatchNumber(
      product.batchNumber
    ).unwrap();
    const response = await triggerGetUnits(togetid.id, true).unwrap();
    const units = response?.data || [];
    // console.log("id", product, "togetid", togetid);
    // console.log("Units for product:", units);

    const baseUnit = units.find((u) => u.baseUnit) || units[0];

    // Fallback if no sale units are found
    const selectedUOM = baseUnit?.name || product.unitOfMeasurement;
    const unitQuantity = baseUnit?.unitQuantity || 1;
    const sellingPrice = baseUnit?.sellingPrice || product.sellingPrice;
    const qtyInSelectedUnit = baseUnit
      ? Math.floor(product.quantity / (baseUnit.unitQuantity || 1))
      : product.quantity;
    setSales((prev) =>
      prev.map((sale) =>
        sale.id === id
          ? {
              ...sale,
              product: selectedProductName,
              batchNumber: product.batchNumber,
              baseQty: product.quantity,
              qty: qtyInSelectedUnit,
              availableUnits: units,
              selectedUOM,
              unitQuantity,
              sellingPrice,
            }
          : sale
      )
    );
  };

  const handleUOMChange = (id, uomName) => {
    setSales((prev) =>
      prev.map((sale) => {
        if (sale.id !== id) return sale;

        const selectedUnit = sale.availableUnits.find(
          (u) => u.name === uomName
        );
        // If selected unit is base, show baseQty directly
        const isBaseUnit = selectedUnit?.baseUnit;
        console.log(
          "Selected unit:",
          selectedUnit,
          isBaseUnit,
          sale.baseQty,
          sale
        );
        const qtyInSelectedUnit = selectedUnit
          ? Math.floor(sale.baseQty / (selectedUnit.unitQuantity || 1))
          : sale.baseQty;
        console.log("Qty in selected unit:", qtyInSelectedUnit);
        return {
          ...sale,
          selectedUOM: uomName,
          unitQuantity: selectedUnit.unitQuantity,
          sellingPrice: selectedUnit.sellingPrice,
          qty: qtyInSelectedUnit,
          totalSellingPrice: sale.quantitySold * selectedUnit.sellingPrice || 0,
        };
      })
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
    const invalidSales = sales.filter((s) => {
      // Find the shop product for this sale
      const shopProduct = shopData.allProducts.find(
        (p) => p.batchNumber === s.batchNumber
      );
      const availableBaseUnits = shopProduct ? shopProduct.quantity : 0;
      const soldBaseUnits = Number(s.quantitySold) * s.unitQuantity;
      return s.quantitySold < 0 || soldBaseUnits > availableBaseUnits;
    });

    if (invalidSales.length > 0) {
      toast.error("Invalid quantity or stock exceeded.", {
        position: "top-center",
      });
      return;
    }
    try {
      await Promise.all(
        sales.map((sale) =>
          addSale({
            name: sale.product,
            batchNumber: sale.batchNumber,
            unitOfMeasurement: sale.selectedUOM,
            unitSellingPrice: sale.sellingPrice, // price for selected UOM
            quantitySold: Number(sale.quantitySold), // in selected UOM
            quantity: Number(sale.quantitySold) * sale.unitQuantity, // in base units
            totalSellingPrice:
              Number(sale.quantitySold) * Number(sale.sellingPrice),
            reference: "Sale",
            seller: userInfo.name,
          }).unwrap()
        )
      );
      toast.success("Sales recorded successfully!");
      dispatch(triggerRefresh());
      setSales([createEmptyRow()]);
    } catch (error) {
      toast.error("Failed to record sales.");
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
                    <td>
                      {sale.availableUnits.length > 1 ? (
                        <Form.Select
                          value={sale.selectedUOM}
                          onChange={(e) =>
                            handleUOMChange(sale.id, e.target.value)
                          }
                          className="form-select-sm"
                        >
                          {sale.availableUnits.map((unit) => (
                            <option key={unit.name} value={unit.name}>
                              {unit.name}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        sale.selectedUOM
                      )}
                    </td>
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
