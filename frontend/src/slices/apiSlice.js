import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
const backendUrl = process.env.REACT_APP_BACKEND_URL;
console.log("Backend URL:", backendUrl);
const baseQuery = fetchBaseQuery({
  baseUrl: backendUrl,
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
