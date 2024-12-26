import { apiSlice } from "./apiSlice";

export const salesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSales: builder.query({
      query: () => "/api/sales",
    }),
    getSalesByDate: builder.query({
      query: (date) => `/api/sales/date?date=${date}`,
    }),
    addSale: builder.mutation({
      query: (saleData) => ({
        url: "/api/sales",
        method: "POST",
        body: saleData,
      }),
    }),
    deleteSale: builder.mutation({
      query: (saleId) => ({
        url: `/api/sales/${saleId}`,
        method: "DELETE",
      }),
    }),
    getSalesByDateRange: builder.query({
      query: ({ startDate, endDate }) =>
        `/api/sales/range?startDate=${startDate}&endDate=${endDate}`,
    }),
    editSale: builder.mutation({
      query: ({ saleId, saleData }) => ({
        url: `/api/sales/${saleId}`,
        method: "PUT",
        body: saleData,
      }),
    }),
  }),
});

export const {
  useGetSalesByDateQuery,
  useAddSaleMutation,
  useDeleteSaleMutation,
  useEditSaleMutation,
  useGetAllSalesQuery,
  useGetSalesByDateRangeQuery,
} = salesApiSlice;
