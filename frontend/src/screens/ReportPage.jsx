import React, { useState, useMemo, useEffect } from "react";
import { Form, Button, Card, Row, Col, Table, Alert } from "react-bootstrap";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { FaDownload } from "react-icons/fa"; // Download icon for better UI
import { saveAs } from "file-saver"; // To trigger file download
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ReportPage = () => {
  const [startDate, setStartDate] = useState(""); // Start date filter
  const [endDate, setEndDate] = useState(""); // End date filter
  const [applyFilters, setApplyFilters] = useState(false); // To track when to apply filters
  const [errorMessage, setErrorMessage] = useState(""); // Validation error message

  // Fetch sales data (Credit) only after filters are applied
  const { data: sales, refetch: refetchSales } = useGetSalesByDateRangeQuery(
    { startDate, endDate },
    { skip: !applyFilters } // Skip query until filters are applied
  );

  // Fetch purchases data (Debit) only after filters are applied
  const { data: purchases, refetch: refetchPurchases } =
    useGetPurchasesByDateRangeQuery(
      { startDate, endDate },
      { skip: !applyFilters } // Skip query until filters are applied
    );

  // Calculate total Debit (Purchases)
  const totalDebit = useMemo(() => {
    return (
      purchases?.reduce(
        (total, purchase) => total + purchase.buying_price * purchase.quantity,
        0
      ) || 0
    );
  }, [purchases]);

  // Calculate total Credit (Sales)
  const totalCredit = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.selling_price * sale.quantity_sold,
        0
      ) || 0
    );
  }, [sales]);

  // Compute balance: Credit - Debit
  const balance = useMemo(
    () => totalCredit - totalDebit,
    [totalDebit, totalCredit]
  );

  // Combine sales and purchases data for the table and sort by date (recent at bottom)
  const reportData = useMemo(() => {
    const reportRows = [];

    purchases?.forEach((purchase) => {
      reportRows.push({
        date: new Date(purchase.purchase_date).toISOString().split("T")[0],
        productName: purchase?.product_name || "Unknown Product",
        amount: purchase.buying_price * purchase.quantity, // Amount for Debit
        type: "DR", // Debit
        user: purchase.user_name,
      });
    });

    sales?.forEach((sale) => {
      reportRows.push({
        date: new Date(sale.sale_date).toISOString().split("T")[0],
        productName: sale?.product_name || "Unknown Product",
        amount: sale.selling_price * sale.quantity_sold, // Amount for Credit
        type: "CR", // Credit
        user: sale.user_name,
      });
    });

    // Sort rows by date (most recent at the bottom)
    return reportRows.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [purchases, sales]);

  const handleDownload = async (id, fileName) => {
    try {
      const input = document.getElementById(id);
      if (!input) {
        throw new Error(`Element with id ${id} not found`);
      }
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString();
      // Convert the content of the table into a canvas image
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // Full page width
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add the image from '/image' at the top (logo or other relevant image)
      const logo = await loadImage("/image.png"); // Make sure to provide the correct path
      pdf.addImage(logo, "PNG", 10, 10, 40, 40); // Add image at the top left

      // Add the period next to the image
      pdf.setFontSize(12);
      pdf.text(`Report Date: ${formattedDate}`, 55, 30);
      pdf.text(`Period: ${startDate} to ${endDate}`, 55, 20);

      // Add some margin between the header and the table content
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const text = "GL Report";
      const textWidth = pdf.getTextWidth(text);
      const textX = (pageWidth - textWidth) / 2;
      pdf.text(text, textX, 60); // Add header

      // Add the table content with padding/margin
      pdf.addImage(imgData, "PNG", 10, 70, imgWidth - 20, imgHeight); // Add some margin around the table

      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth - 20, imgHeight); // Add margin for subsequent pages
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Helper function to load the image
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  };

  // Handle filter application
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

      {/* Display Error Message */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Row>
        {/* Report Summary */}
        <Col md={9}>
          <Card className="text-center mb-4 shadow">
            <Card.Body>
              <Card.Title>GL Report</Card.Title>
              <Card.Text className="d-flex justify-content-around">
                <strong>Total Debit:</strong> {totalDebit} ETB <br />
                <strong>Total Credit:</strong> {totalCredit} ETB <br />
                <strong>Balance:</strong> {balance} ETB
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Download Button */}
        <Col md={3}>
          <div className="text-end mb-3">
            <Button
              variant="success"
              onClick={() =>
                handleDownload("report-table-section", "financial-report.pdf")
              }
            >
              <FaDownload /> Download Report
            </Button>
          </div>
        </Col>
      </Row>

      <div id="report-table-section">
        {/* Report Table */}
        <Table striped bordered hover className="shadow-sm">
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
            {reportData.map((row, index) => (
              <tr key={index}>
                <td>{row.date}</td>
                <td>{row.productName}</td>
                <td>{row.amount}</td>
                <td>{row.type}</td>
                <td>{row.user}</td>
              </tr>
            ))}

            {/* Add balance row at the bottom */}
            <tr>
              <td></td>
              <td>
                <strong>Balance</strong>
              </td>
              <td>
                <strong>{balance} ETB</strong>
              </td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ReportPage;
