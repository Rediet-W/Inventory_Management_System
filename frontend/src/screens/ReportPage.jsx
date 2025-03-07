import React, { useState, useMemo, useRef } from "react";
import { Form, Button, Card, Row, Col, Table, Alert } from "react-bootstrap";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import { FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

const ReportPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applyFilters, setApplyFilters] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: sales } = useGetSalesByDateRangeQuery(
    { startDate, endDate },
    { skip: !applyFilters }
  );
  const { data: purchases } = useGetPurchasesByDateRangeQuery(
    { startDate, endDate },
    { skip: !applyFilters }
  );

  const reportData = useMemo(() => {
    const reportRows = [];

    purchases?.forEach((purchase) => {
      reportRows.push({
        date: new Date(purchase.purchase_date).toISOString().split("T")[0],
        productName: purchase?.product_name || "Unknown Product",
        amount: purchase.buying_price * purchase.quantity,
        type: "DR",
        user: purchase.user_name,
      });
    });

    sales?.forEach((sale) => {
      reportRows.push({
        date: new Date(sale.sale_date).toISOString().split("T")[0],
        productName: sale?.product_name || "Unknown Product",
        amount: sale.selling_price * sale.quantity_sold,
        type: "CR",
        user: sale.user_name,
      });
    });

    return reportRows.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [purchases, sales]);

  const reportRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => {
      console.log("📄 reportRef:", reportRef.current);
      return reportRef.current || console.error("❌ reportRef is null.");
    },
    documentTitle: `Financial_Report_${startDate}_to_${endDate}`,
    onAfterPrint: () => console.log("✅ Printing completed!"),
  });

  const handleSafePrint = () => {
    if (!reportRef.current) {
      console.error("❌ reportRef is null. Printing aborted.");
      return;
    }
    console.log("📄 reportRef:", reportRef.current);
    if (reportData.length === 0) {
      alert("No data available to print!");
      return;
    }
    handlePrint();
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4 fw-bold">Financial Report</h1>

      <Card className="p-4 mb-4 shadow-sm">
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
                onClick={() => setApplyFilters(true)}
              >
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Row className="justify-content-end mb-3">
        <Col md={3} className="text-end mb-3">
          <Button variant="success" onClick={handleSafePrint}>
            <FaPrint /> Print Report
          </Button>
        </Col>
      </Row>

      <div ref={reportRef} className="print-section">
        <h3 className="text-center">Financial Report</h3>
        <p className="text-center">
          {startDate && endDate
            ? `${startDate} - ${endDate}`
            : "No date selected"}
        </p>
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Date</th>
              <th>Product Name</th>
              <th>Amount (ETB)</th>
              <th>DR/CR</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length > 0 ? (
              reportData.map((row, index) => (
                <tr key={index}>
                  <td>{row.date}</td>
                  <td>{row.productName}</td>
                  <td>{row.amount}</td>
                  <td>{row.type}</td>
                  <td>{row.user}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ReportPage;
