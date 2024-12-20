import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://inventory-management-system-mk96.onrender.com",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // Retrieve userInfo from the Redux state
    const userInfo = getState().auth.userInfo;
    console.log("Redux User Info:", getState().auth.userInfo);
    // If a token exists in userInfo, set it in the Authorization header
    if (userInfo?.token) {
      headers.set("Authorization", `Bearer ${userInfo.token}`);
    }

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "RequestedProduct"], // Add other tags as needed
  endpoints: (builder) => ({}), // Define your endpoints here
});
