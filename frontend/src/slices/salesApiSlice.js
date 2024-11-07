import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const salesApiSlice = createApi({
  reducerPath: "salesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    // Fetch all sales
    getAllSales: builder.query({
      query: () => "/sales", // Route to get all sales
    }),
    // Fetch sales for a specific date
    getSalesByDate: builder.query({
      query: (date) => `/sales/date?date=${date}`, // Adjusted for the new route
    }),
    // Add a new sale
    addSale: builder.mutation({
      query: (saleData) => ({
        url: "/sales",
        method: "POST",
        body: saleData,
      }),
    }),
    // Delete a sale
    deleteSale: builder.mutation({
      query: (saleId) => ({
        url: `/sales/${saleId}`,
        method: "DELETE",
      }),
    }),
    getSalesByDateRange: builder.query({
      query: ({ startDate, endDate }) =>
        `/sales/range?startDate=${startDate}&endDate=${endDate}`,
    }),
    // Edit a sale
    editSale: builder.mutation({
      query: ({ saleId, saleData }) => ({
        url: `/sales/${saleId}`,
        method: "PUT",
        body: saleData,
      }),
    }),
  }),
});

// Export the hooks to use in the component
export const {
  useGetSalesByDateQuery,
  useAddSaleMutation,
  useDeleteSaleMutation,
  useEditSaleMutation,
  useGetAllSalesQuery,
  useGetSalesByDateRangeQuery,
} = salesApiSlice;
