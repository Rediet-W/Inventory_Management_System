import React, { useState } from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../slices/userApiSlice";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { FaTrashAlt } from "react-icons/fa";
import { Alert } from "react-bootstrap";

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

        console.log("Delete Response:", response); // Debugging

        // ✅ Only set an error message if `success` is explicitly `false`
        if (response?.success) {
          refetch(); // Refresh users list after deletion
        } else {
          setErrorMessage(response?.message || "Failed to delete user");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        setErrorMessage(err.data?.message || "Error deleting user");
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <Alert variant="danger" className="text-center">
        {error?.data?.message || "Failed to load employees"}
      </Alert>
    );

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Employees Management</h2>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <table className="table table-striped table-hover table-bordered shadow-sm">
        <thead className="table-dark">
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
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-danger btn-sm"
                      disabled={deletingUserId === user.id}
                    >
                      <FaTrashAlt className="me-2" />{" "}
                      {deletingUserId === user.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-warning">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeesPage;
