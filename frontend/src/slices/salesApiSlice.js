import { apiSlice } from "./apiSlice";

export const salesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSales: builder.query({
      query: () => "/sales",
    }),
    getSalesByDate: builder.query({
      query: (date) => `/sales/date?date=${date}`,
    }),
    addSale: builder.mutation({
      query: (saleData) => ({
        url: "/sales",
        method: "POST",
        body: saleData,
      }),
    }),
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
    editSale: builder.mutation({
      query: ({ saleId, saleData }) => ({
        url: `/sales/${saleId}`,
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
