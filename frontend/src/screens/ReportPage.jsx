import React, { useState, useMemo } from "react";
import { Form, Button, Card, Row, Col, Table, Alert } from "react-bootstrap";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";

const ReportPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applyFilters, setApplyFilters] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: sales, refetch: refetchSales } = useGetSalesByDateRangeQuery(
    { startDate, endDate },
    { skip: !applyFilters }
  );

  const totalCredit = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.selling_price * sale.quantity_sold,
        0
      ) || 0
    );
  }, [sales]);

  const handleDownload = async (id, fileName) => {
    try {
      const input = document.getElementById(id);
      if (!input) {
        throw new Error(`Element with id ${id} not found`);
      }

      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("en-GB");
      const formattedStartDate = new Date(startDate).toLocaleDateString(
        "en-GB"
      );
      const formattedEndDate = new Date(endDate).toLocaleDateString("en-GB");

      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Add logo and header
      // const logo = await loadImage("/path-to-logo/logo.png");
      pdf.addImage(logo, "PNG", 10, 10, 30, 30);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Financial Report", 55, 20);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Report Date: ${formattedDate}`, 55, 30);
      pdf.text(`Period: ${formattedStartDate} to ${formattedEndDate}`, 55, 40);

      // Add table content
      pdf.addImage(imgData, "PNG", 10, 50, imgWidth - 20, imgHeight);

      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth - 20, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  };

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
    <div className="container mt-4">
      <h1 className="text-center mb-4 fw-bold">Financial Report</h1>

      {/* Date Filters */}
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
                onClick={handleApplyFilters}
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
          <Button
            variant="success"
            onClick={() =>
              handleDownload("report-table-section", "financial-report.pdf")
            }
          >
            <FaDownload /> Download Report
          </Button>
        </Col>
      </Row>

      <div id="report-table-section">
        {/* Report Table */}
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
            {sales?.map((sale, index) => (
              <tr key={index}>
                <td>{new Date(sale.sale_date).toLocaleDateString("en-GB")}</td>
                <td>{sale.product_name}</td>
                <td>{sale.selling_price * sale.quantity_sold}</td>
                <td>CR</td>
                <td>{sale.user_name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ReportPage;
