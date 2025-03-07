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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";

const SummaryPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tabKey, setTabKey] = useState("sell");
  const [applyFilters, setApplyFilters] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch sales & purchases within the date range
  const { data: sales } = useGetSalesByDateRangeQuery(
    applyFilters && startDate && endDate ? { startDate, endDate } : {},
    { skip: !applyFilters }
  );

  const { data: purchases } = useGetPurchasesByDateRangeQuery(
    applyFilters && startDate && endDate ? { startDate, endDate } : {},
    { skip: !applyFilters }
  );
  console.log("purchases", purchases);
  console.log("sales", sales);
  // Calculate total sales amount
  const totalSales = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.unitSellingPrice * sale.quantity,
        0
      ) || 0
    );
  }, [sales]);

  // Calculate total purchase amount
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

  const exportPDF = async (sectionId, title) => {
    const input = document.getElementById(sectionId);
    if (!input) {
      console.error(`Element with id ${sectionId} not found`);
      return;
    }

    const currentDate = new Date().toLocaleDateString("en-GB");
    const formattedStartDate = startDate
      ? new Date(startDate).toLocaleDateString("en-GB")
      : "N/A";
    const formattedEndDate = endDate
      ? new Date(endDate).toLocaleDateString("en-GB")
      : "N/A";

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add header
    pdf.addImage(logo, "PNG", 10, 10, 30, 30); // Adjust size and position as needed
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 55, 20);
    pdf.setFontSize(12);
    pdf.text(`Generated On: ${currentDate}`, 55, 30);
    pdf.text(`Period: ${formattedStartDate} to ${formattedEndDate}`, 55, 40);

    // Add content
    pdf.addImage(imgData, "PNG", 10, 50, imgWidth, imgHeight);

    // Save the PDF
    pdf.save(`${title}.pdf`);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 fw-bold">Shop Summary</h1>

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
              <button
                onClick={() => exportPDF("sales-section", "Sales Report")}
                className="btn btn-success"
              >
                <FaDownload /> Export as PDF
              </button>
            </div>
            <div id="sales-section">
              <Table striped bordered hover responsive className="mt-3">
                <thead className="">
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit Selling Price</th>
                    <th>Total Selling Price</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.map((sale, index) => (
                    <tr key={index}>
                      <td>
                        {sale?.createdAt?.split("T")[0] || "Unknown Date"}
                      </td>
                      <td>{sale.name || "Unknown Product"}</td>
                      <td>{sale.quantity}</td>
                      <td>{sale.unitSellingPrice} ETB</td>
                      <td>{sale.quantity * sale.unitSellingPrice} ETB</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan="4">Total</td>
                    <td>{totalSales} ETB</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Tab.Pane>

          {/* Purchases Summary */}
          <Tab.Pane eventKey="purchase">
            <div className="d-flex justify-content-end mb-3">
              <button
                onClick={() =>
                  exportPDF("purchases-section", "Purchase Report")
                }
                className="btn btn-success"
              >
                <FaDownload /> Export as PDF
              </button>
            </div>
            <div id="purchases-section">
              <Table striped bordered hover responsive className="mt-3">
                <thead className="">
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases?.data?.map((purchase, index) => (
                    <tr key={index}>
                      <td>
                        {purchase?.createdAt?.split("T")[0] || "Unknown Date"}
                      </td>
                      <td>{purchase.name || "Unknown Product"}</td>
                      <td>{purchase.quantity}</td>
                      <td>{purchase.unitCost} ETB</td>
                      <td>{purchase.quantity * purchase.unitCost} ETB</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan="4">Total</td>
                    <td>{totalPurchases} ETB</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default SummaryPage;
