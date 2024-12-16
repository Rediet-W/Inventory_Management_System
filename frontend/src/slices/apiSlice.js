import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://inventory-management-system-mk96.onrender.com/",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({}),
});
