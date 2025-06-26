import React, { useState, useMemo } from "react";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import {
  Nav,
  Tab,
  Form,
  Button,
  Alert,
  Card,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SalesPDF from "./SalesPdf";
import PurchasesPDF from "./PurchasePdf";
import finote from "/logo.jpg";

const SummaryPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tabKey, setTabKey] = useState("sell");
  const [applyFilters, setApplyFilters] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: sales } = useGetSalesByDateRangeQuery(
    applyFilters && startDate && endDate ? { startDate, endDate } : {},
    { skip: !applyFilters }
  );

  const { data: purchases } = useGetPurchasesByDateRangeQuery(
    applyFilters && startDate && endDate ? { startDate, endDate } : {},
    { skip: !applyFilters }
  );

  const totalSales = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.unitSellingPrice * sale.quantity,
        0
      ) || 0
    );
  }, [sales]);

  const totalCost = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.averageCost * sale.quantity,
        0
      ) || 0
    );
  }, [sales]);

  const totalPurchases = useMemo(() => {
    return (
      purchases?.data?.reduce(
        (total, purchase) => total + purchase.unitCost * purchase.quantity,
        0
      ) || 0
    );
  }, [purchases]);

  const handleApplyFilters = () => {
    if (!startDate || !endDate) {
      setErrorMessage("Both start and end dates are required.");
    } else if (new Date(startDate) > new Date(endDate)) {
      setErrorMessage("Start date cannot be later than end date.");
    } else {
      setErrorMessage("");
      setApplyFilters(true);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="ml-4 mb-4 fw-bold">Shop Summary</h1>

      {/* Date Filters */}
      <Card className="p-4 mb-4">
        <Form>
          <Row className="align-items-center">
            <Col md={4}>
              <Form.Group controlId="startDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <Button
                variant="primary"
                className="mt-3"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {/* Tabs for Sales and Purchases */}
      <Tab.Container activeKey={tabKey} onSelect={(key) => setTabKey(key)}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="sell">Sales</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="purchase">Purchases</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Sales Summary */}
          <Tab.Pane eventKey="sell">
            <div className="d-flex justify-content-end mb-3">
              <PDFDownloadLink
                document={
                  <SalesPDF
                    sales={sales}
                    totalSales={totalSales}
                    header="የፍኖተ ጽድቅ ሰ/ት/ቤት የንዋየ ቅድሳት መሸጫ ሱቅ"
                    dateRange={`From ${startDate} to ${endDate}`}
                    totalCost={totalCost}
                    logo={finote}
                  />
                }
                fileName="sales_report.pdf"
              >
                {({ loading }) => (
                  <button
                    className="btn btn-success d-flex gap-2 items-center"
                    disabled={loading}
                  >
                    <FaDownload />{" "}
                    {loading ? "Generating PDF..." : "Export as PDF"}
                  </button>
                )}
              </PDFDownloadLink>
            </div>

            {/* Render Sales Table */}
            <Table striped bordered hover responsive className="mt-3">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>UOM</th>
                  <th>Quantity</th>
                  <th>Unit Selling Price</th>
                  <th>Total Selling Price</th>
                  <th>Average Cost</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {sales?.map((sale, index) => {
                  const hasNegativeQty = sale.quantity < 0;
                  return (
                    <tr
                      key={index}
                      className={hasNegativeQty ? "table-warning" : ""}
                    >
                      <td>
                        {sale?.createdAt?.split("T")[0] || "Unknown Date"}
                      </td>
                      <td>{sale.name || "Unknown Product"}</td>
                      <td>{sale.unitOfMeasurement}</td>
                      <td>{sale.quantitySold}</td>
                      <td>
                        {hasNegativeQty ? "Adjustment" : sale.unitSellingPrice}{" "}
                      </td>
                      <td>
                        {hasNegativeQty
                          ? "-"
                          : sale.quantity * sale.unitSellingPrice}{" "}
                      </td>
                      <td>{hasNegativeQty ? "-" : sale.averageCost} </td>
                      <td>
                        {hasNegativeQty
                          ? "-"
                          : sale.quantity * sale.averageCost}{" "}
                      </td>
                    </tr>
                  );
                })}
                <tr className="fw-bold">
                  <td colSpan="5">Total </td>
                  <td colSpan="1">{totalSales.toFixed(2)} ETB</td>
                  <td colSpan="1"></td>
                  <td colSpan="1">{totalCost.toFixed(2)} ETB</td>
                </tr>
              </tbody>
            </Table>
          </Tab.Pane>

          {/* Purchases Summary */}
          <Tab.Pane eventKey="purchase">
            <div className="d-flex justify-content-end mb-3">
              <PDFDownloadLink
                document={
                  <PurchasesPDF
                    purchases={purchases?.data}
                    totalPurchases={totalPurchases}
                    header="የፍኖተ ጽድቅ ሰ/ት/ቤት የንዋየ ቅድሳት መሸጫ ሱቅ"
                    dateRange={` ${startDate} - ${endDate}`}
                    logo={finote}
                  />
                }
                fileName="purchases_report.pdf"
              >
                {({ loading }) => (
                  <button
                    className="btn btn-success d-flex gap-2 items-center"
                    disabled={loading}
                  >
                    <FaDownload />{" "}
                    <span>
                      {loading ? "Generating PDF..." : "Export as PDF"}
                    </span>
                  </button>
                )}
              </PDFDownloadLink>
            </div>

            {/* Render Purchases Table */}
            <Table striped bordered hover responsive className="mt-3">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>UOM</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {purchases?.data?.map((purchase, index) => {
                  const hasNegativeQty = purchase.quantity < 0;
                  return (
                    <tr
                      key={index}
                      className={hasNegativeQty ? "table-warning" : ""}
                    >
                      <td>
                        {purchase?.createdAt?.split("T")[0] || "Unknown Date"}
                      </td>
                      <td>{purchase.name || "Unknown Product"}</td>
                      <td>{purchase.unitOfMeasurement || "Unknown UOM"}</td>
                      <td>{purchase.quantity}</td>
                      <td>
                        {hasNegativeQty ? "Adjustment" : purchase.unitCost}{" "}
                      </td>
                      <td>
                        {hasNegativeQty
                          ? "-"
                          : purchase.quantity * purchase.unitCost}{" "}
                      </td>
                    </tr>
                  );
                })}
                <tr className="fw-bold">
                  <td colSpan="5">Total</td>
                  <td>{totalPurchases} ETB</td>
                </tr>
              </tbody>
            </Table>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default SummaryPage;
