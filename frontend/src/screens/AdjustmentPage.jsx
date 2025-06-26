import React, { useState } from "react";
import {
  Table,
  Nav,
  Row,
  Col,
  Spinner,
  Button,
  Badge,
  Dropdown,
  DropdownButton,
  Card,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  useGetAdjustmentsQuery,
  useApproveAdjustmentMutation,
  useRejectAdjustmentMutation,
} from "../slices/adjustmentApiSlice";
import { toast } from "react-toastify";

const AdjustmentsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const {
    data: adjustments = [],
    isLoading,
    error,
    refetch,
  } = useGetAdjustmentsQuery();
  const [approveAdjustment, { isLoading: isApproving }] =
    useApproveAdjustmentMutation();
  const [rejectAdjustment, { isLoading: isRejecting }] =
    useRejectAdjustmentMutation();

  const [statusTab, setStatusTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");

  const handleApprove = async (id) => {
    try {
      await approveAdjustment({ id, approvedBy: userInfo.name }).unwrap();
      toast.success("Adjustment approved");
      refetch();
    } catch (err) {
      toast.error("Failed to approve adjustment");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAdjustment({ id, approvedBy: userInfo.name }).unwrap();
      toast.info("Adjustment rejected");
      refetch();
    } catch (err) {
      toast.error("Failed to reject adjustment");
    }
  };

  if (isLoading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error) {
    toast.error("Error loading adjustments");
    return null;
  }

  // Filter adjustments by status and type
  let filteredAdjustments = adjustments.filter(
    (adj) => adj.status === statusTab
  );
  if (typeFilter !== "all") {
    filteredAdjustments = filteredAdjustments.filter(
      (adj) => adj.type === typeFilter
    );
  }

  const renderTable = (rows) => (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Batch No.</th>
            <th>Old Qty</th>
            <th>New Qty</th>
            <th>Reason</th>
            <th>Requested By</th>
            <th>Mode</th>
            {statusTab === "pending" ? (
              <th>Actions</th>
            ) : (
              <th>
                {statusTab === "approved" ? "Approved By" : "Rejected By"}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-muted py-4">
                No adjustments found
              </td>
            </tr>
          ) : (
            rows.map((adj, idx) => (
              <tr key={adj.id}>
                <td>{idx + 1}</td>
                <td>
                  <Badge
                    bg={adj.type === "purchase" ? "primary" : "warning"}
                    className="text-uppercase"
                    style={
                      adj.type === "purchase"
                        ? { backgroundColor: "#1E43FA" }
                        : {}
                    }
                  >
                    {adj.type}
                  </Badge>
                </td>
                <td>{adj.batchNumber}</td>
                <td>{adj.oldQuantity ?? "-"}</td>
                <td>{adj.quantity}</td>
                <td>{adj.reason}</td>
                <td>{adj.requestedBy}</td>
                <td>{adj.mode}</td>

                <td>
                  {adj.status === "pending" ? (
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(adj.id)}
                        disabled={isApproving}
                      >
                        {isApproving ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Approving...
                          </>
                        ) : (
                          "Approve"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleReject(adj.id)}
                        disabled={isRejecting}
                      >
                        {isRejecting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Rejecting...
                          </>
                        ) : (
                          "Reject"
                        )}
                      </Button>
                    </div>
                  ) : (
                    adj.approvedBy || "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );

  // Dropdown label
  const typeLabel =
    typeFilter === "all"
      ? "All Types"
      : typeFilter === "purchase"
      ? "Purchase"
      : "Sales";

  return (
    <div className="container-fluid p-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0" style={{ color: "#1E43FA" }}>
              Adjustment Requests
            </h3>
            <DropdownButton
              id="type-filter-dropdown"
              title={typeLabel}
              variant="outline-secondary"
              align="end"
              className="ms-auto"
              onSelect={setTypeFilter}
            >
              <Dropdown.Item eventKey="all" active={typeFilter === "all"}>
                All Types
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="purchase"
                active={typeFilter === "purchase"}
              >
                Purchase
              </Dropdown.Item>
              <Dropdown.Item eventKey="sale" active={typeFilter === "sale"}>
                Sales
              </Dropdown.Item>
            </DropdownButton>
          </div>

          <Tabs
            id="status-tabs"
            activeKey={statusTab}
            onSelect={setStatusTab}
            className="mb-4"
          >
            <Tab eventKey="pending" title="Pending" />
            <Tab eventKey="approved" title="Approved" />
            <Tab eventKey="rejected" title="Rejected" />
          </Tabs>

          {renderTable(filteredAdjustments)}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdjustmentsPage;
