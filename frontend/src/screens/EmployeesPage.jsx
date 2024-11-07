import React from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../slices/userApiSlice";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { FaTrashAlt } from "react-icons/fa";

const EmployeesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const { data: users, isLoading, isError, error } = useGetUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId).unwrap();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <div className="alert alert-danger" role="alert">
        {error?.data?.message || error.error}
      </div>
    );

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Employees Management</h2>

      {isDeleting && <Loader />}

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
          {users.map((user) => (
            <tr key={user.id}>
              {" "}
              {/* Use 'id' for MySQL */}
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              {userInfo?.isPrimaryAdmin && (
                <td>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="btn btn-danger btn-sm"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <FaTrashAlt className="me-2" /> Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="alert alert-warning text-center">
          No employees found.
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
