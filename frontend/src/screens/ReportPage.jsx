import React, { useState, useMemo, useRef } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import { FaPrint } from "react-icons/fa";
import { toast } from "react-toastify";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportPDF from "../pdfs/ReportPDF";

const ReportPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applyFilters, setApplyFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only fetch when filters are applied and both dates are set
  const { data: sales, isLoading: salesLoading } = useGetSalesByDateRangeQuery(
    applyFilters && startDate && endDate ? { startDate, endDate } : {},
    { skip: !applyFilters }
  );
  const { data: purchases, isLoading: purchasesLoading } =
    useGetPurchasesByDateRangeQuery(
      applyFilters && startDate && endDate ? { startDate, endDate } : {},
      { skip: !applyFilters }
    );

  const reportData = useMemo(() => {
    const reportRows = [];

    purchases?.data?.forEach((purchase) => {
      reportRows.push({
        date: formatDate(purchase.createdAt),
        productName: purchase?.name || "Unknown Product",
        amount: Number(purchase.totalCost),
        type: "DR",
        user: purchase.purchaser,
      });
    });

    sales?.forEach((sale) => {
      reportRows.push({
        date: formatDate(sale.createdAt),
        productName: sale?.name || "Unknown Product",
        amount: Number(sale.totalSellingPrice),
        type: "CR",
        user: sale.seller,
      });
    });

    return reportRows.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [purchases, sales]);
  const reportRef = useRef();

  const handleApplyFilters = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }
    setApplyFilters(true);
  };
  function formatDate(dateValue) {
    if (!dateValue) return "Unknown Date";
    const date = new Date(dateValue);
    return isNaN(date) ? "Unknown Date" : date.toISOString().split("T")[0];
  }
  return (
    <div className="container mt-4">
      <div className="bg-white p-4 rounded-3 shadow-sm">
        <h1 className="text-center mb-4" style={{ color: "#1E43FA" }}>
          Financial Report
        </h1>

        <Card className="p-4 mb-4 shadow-sm border-0">
          <Form>
            <Row className="align-items-center">
              <Col md={4}>
                <Form.Group controlId="startDate">
                  <Form.Label className="fw-medium">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="endDate">
                  <Form.Label className="fw-medium">End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="text-end">
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={handleApplyFilters}
                  disabled={salesLoading || purchasesLoading}
                >
                  {salesLoading || purchasesLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </>
                  ) : (
                    "Apply Filters"
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        <Row className="justify-content-end mb-3">
          <Col md={3} className="text-end mb-3">
            <PDFDownloadLink
              document={
                <ReportPDF
                  reportData={reportData}
                  dateRange={
                    startDate && endDate
                      ? `${startDate} - ${endDate}`
                      : "No date selected"
                  }
                />
              }
              fileName={`financial_report_${startDate}_to_${endDate}.pdf`}
            >
              {({ loading }) => (
                <button
                  className="btn btn-success d-flex gap-2 align-items-center "
                  disabled={loading || reportData.length === 0}
                >
                  <FaPrint /> {loading ? "Generating PDF..." : "Print Report"}
                </button>
              )}
            </PDFDownloadLink>
          </Col>
        </Row>

        <div ref={reportRef} className="print-section">
          <h3 className="text-center">Financial Report</h3>
          <p className="text-center">
            {startDate && endDate
              ? `${startDate} - ${endDate}`
              : "No date selected"}
          </p>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-light">
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
                      <td>{row.amount.toFixed(2)}</td>
                      <td>{row.type}</td>
                      <td>{row.user}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      {applyFilters
                        ? "No data available for selected dates"
                        : "Please select date range and apply filters"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
