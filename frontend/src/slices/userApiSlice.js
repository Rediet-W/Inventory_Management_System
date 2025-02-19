import { apiSlice } from "./apiSlice";
const USERS_URL = "/api/users";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("Login failed:", response.message);
          throw new Error(response.message || "Error logging in");
        }
        return response.data;
      },
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("Logout failed:", response.message);
          throw new Error(response.message || "Error logging out");
        }
        return response.data;
      },
    }),

    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("Registration failed:", response.message);
          throw new Error(response.message || "Error registering user");
        }
        return response.data;
      },
    }),

    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("Profile update failed:", response.message);
          throw new Error(response.message || "Error updating profile");
        }
        return response.data;
      },
    }),

    getUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("Failed to fetch users:", response.message);
          throw new Error(response.message || "Error fetching users");
        }
        return response.data;
      },
      providesTags: ["User"],
    }),

    // Delete User (Admin)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/api/users/${userId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("User deletion failed:", response.message);
          throw new Error(response.message || "Error deleting user");
        }
        return response.data;
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateUserMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
} = userApiSlice;
