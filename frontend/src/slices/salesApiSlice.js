import { apiSlice } from "./apiSlice";
export const salesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSales: builder.query({
      query: () => "/api/sales",
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Failed to fetch all sales:", response.message);
          throw new Error(response.message || "Error fetching all sales");
        }
        return response.data;
      },
      providesTags: ["Sale"],
    }),

    getSalesByDate: builder.query({
      query: (date) => `/api/sales/date?date=${date}`,
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to fetch sales for date ${date}:`,
            response.message
          );
          throw new Error(response.message || "Error fetching sales");
        }
        return response.data;
      },
      providesTags: ["Sale"],
    }),

    getSalesByBatchNumber: builder.query({
      query: (batchNumber) => `/api/sales/batch/${batchNumber}`,
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to fetch sales for batch number ${batchNumber}:`,
            response.message
          );
          throw new Error(response.message || "Error fetching sales by batch");
        }
        return response.data;
      },
      providesTags: ["Sale"],
    }),

    addSale: builder.mutation({
      query: (saleData) => ({
        url: "/api/sales",
        method: "POST",
        body: saleData,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            "❌ Failed to add sale:",
            response.errors || response.message
          );
          throw new Error(response.message || "Sale creation failed");
        }
        return response.data;
      },
      invalidatesTags: ["Sale"],
    }),

    deleteSale: builder.mutation({
      query: (saleId) => ({
        url: `/api/sales/${saleId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to delete sale ${saleId}:`,
            response.message
          );
          throw new Error(response.message || "Error deleting sale");
        }
        return response.data;
      },
      invalidatesTags: ["Sale"],
    }),

    getSalesByDateRange: builder.query({
      query: ({ startDate, endDate }) =>
        `/api/sales/range?startDate=${startDate}&endDate=${endDate}`,
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to fetch sales between ${startDate} and ${endDate}:`,
            response.message
          );
          throw new Error(
            response.message || "Error fetching sales by date range"
          );
        }
        return response.data;
      },
      providesTags: ["Sale"],
    }),

    editSale: builder.mutation({
      query: ({ saleId, saleData }) => ({
        url: `/api/sales/${saleId}`,
        method: "PUT",
        body: saleData,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to edit sale ${saleId}:`,
            response.errors || response.message
          );
          throw new Error(response.message || "Sale update failed");
        }
        return response.data;
      },
      invalidatesTags: ["Sale"],
    }),
  }),
});

export const {
  useGetSalesByDateQuery,
  useGetSalesByBatchNumberQuery,
  useAddSaleMutation,
  useDeleteSaleMutation,
  useEditSaleMutation,
  useGetAllSalesQuery,
  useGetSalesByDateRangeQuery,
} = salesApiSlice;
