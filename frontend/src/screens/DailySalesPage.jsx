import React, { useState, useMemo, useEffect } from "react";
import { useGetSalesByDateQuery } from "../slices/salesApiSlice";
import { useCreateAdjustmentMutation } from "../slices/adjustmentApiSlice";
import { Table, Card, Spinner, Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const DailySalesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const today = new Date().toISOString().split("T")[0];
  const { data: sales, error, isLoading } = useGetSalesByDateQuery(today);

  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");

  const [createAdjustment, { isLoading: isCreating }] =
    useCreateAdjustmentMutation();

  const handleOpenModal = (sale) => {
    setSelectedSale(sale);
    setNewQuantity("");
    setReason("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedSale(null);
    setShowModal(false);
  };

  const handleSubmitAdjustment = async () => {
    if (!newQuantity || !reason) {
      toast.error("Please fill all fields.");
      return;
    }

    const payload = {
      type: "sale",
      batchNumber: selectedSale.batchNumber,
      quantity: parseInt(newQuantity),
      oldQuantity: selectedSale.quantity,
      reason,
      requestedBy: userInfo.name,
      mode: userInfo.role === "admin" ? "direct" : "requested",
    };

    try {
      await createAdjustment(payload).unwrap();
      toast.success("Adjustment request submitted.");
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to submit adjustment.");
      console.error(err);
    }
  };

  const totalSales = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.unitSellingPrice * sale.quantity,
        0
      ) || 0
    );
  }, [sales]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch sales data", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  }, [error]);

  return (
    <div className="container-fluid p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="mb-0" style={{ color: "#1E43FA" }}>
            Today's Sales
          </h3>

          <Card className="border-0 bg-light mb-4">
            <Card.Body className="text-center">
              <h4>Sales Summary for {today}</h4>
              <div className="d-flex justify-content-center gap-5 mt-3">
                <div className="text-center">
                  <h6 className="text-muted">Total Sales</h6>
                  <h4 className="text-primary">{totalSales.toFixed(2)} ETB</h4>
                </div>
              </div>
            </Card.Body>
          </Card>

          {isLoading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>UOM</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.length > 0 ? (
                    sales.map((sale, index) => (
                      <tr key={index}>
                        <td>{sale.createdAt?.split("T")[0] || "N/A"}</td>
                        <td>{sale.name || "Unknown"}</td>
                        <td>{sale.unitOfMeasurement || "N/A"}</td>
                        <td>{sale.quantitySold}</td>
                        <td>{Number(sale.unitSellingPrice).toFixed(2)}</td>
                        <td>
                          {(sale.quantity * sale.unitSellingPrice).toFixed(2)}
                        </td>
                        <td>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleOpenModal(sale)}
                          >
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No sales recorded for today
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Adjustment Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Request Sales Adjustment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Product:</strong> {selectedSale?.name}
          </p>
          <p>
            <strong>Batch:</strong> {selectedSale?.batchNumber}
          </p>
          <p>
            <strong>Original Qty:</strong> {selectedSale?.quantity}
          </p>
          <Form.Group controlId="newQty" className="mb-3">
            <Form.Label>New Quantity</Form.Label>
            <Form.Control
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder="Enter corrected quantity"
              min={selectedSale?.quantity}
            />
          </Form.Group>
          <Form.Group controlId="reason">
            <Form.Label>Reason for Adjustment</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the adjustment is needed"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitAdjustment}
            disabled={isCreating}
          >
            {isCreating ? "Submitting..." : "Submit Request"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DailySalesPage;
