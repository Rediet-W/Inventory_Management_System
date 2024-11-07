import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const summaryApiSlice = createApi({
  reducerPath: "summaryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }), // Assuming your API is accessible at `/api`
  endpoints: (builder) => ({
    // Fetch sales within a date range
    getSalesByDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        let url = "/sales/range";
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `${url}?${params.toString()}`; // Constructs the URL with query params
      },
    }),
    // Fetch purchases within a date range
    getPurchasesByDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        let url = "/purchases/range";
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `${url}?${params.toString()}`; // Constructs the URL with query params
      },
    }),
  }),
});

// Export hooks for the defined queries
export const { useGetSalesByDateRangeQuery, useGetPurchasesByDateRangeQuery } =
  summaryApiSlice;
