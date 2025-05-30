import React, { useState } from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../slices/userApiSlice";
import { useSelector } from "react-redux";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const EmployeesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading, isError, error, refetch } = useGetUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [errorMessage, setErrorMessage] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setDeletingUserId(userId);
        const response = await deleteUser(userId).unwrap();

        if (response?.success) {
          toast.success("User deleted successfully");
          refetch();
        } else {
          toast.error(response?.message || "Failed to delete user");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        toast.error(err.data?.message || "Error deleting user");
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  if (isLoading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (isError)
    return (
      <Alert variant="danger" className="text-center">
        {error?.data?.message || "Failed to load employees"}
      </Alert>
    );

  return (
    <div className="container mt-4">
      <div className="bg-white p-4 rounded-3 shadow-sm">
        <h2 className="text-center mb-4" style={{ color: "#1E43FA" }}>
          Users Management
        </h2>

        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {userInfo?.isPrimaryAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? (
                data.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    {userInfo?.isPrimaryAdmin && (
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingUserId === user.id}
                          className="d-flex align-items-center"
                        >
                          {deletingUserId === user.id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <FaTrashAlt className="me-2" /> Delete
                            </>
                          )}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={userInfo?.isPrimaryAdmin ? 4 : 3}
                    className="text-center text-muted"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
