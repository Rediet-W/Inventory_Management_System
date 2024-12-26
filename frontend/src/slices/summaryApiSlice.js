import { apiSlice } from "./apiSlice"; // Reuse the base configuration from apiSlice

export const summaryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch sales within a date range
    getSalesByDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        let url = "/api/sales/range";
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `${url}?${params.toString()}`; // Constructs the URL with query params
      },
    }),
    // Fetch purchases within a date range
    getPurchasesByDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        let url = "/api/purchases/";
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
