import { apiSlice } from "./apiSlice"; // Reuse the base configuration from apiSlice

const PURCHASES_URL = "/api/purchases";

export const purchaseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPurchases: builder.query({
      query: ({ startDate, endDate } = {}) => ({
        url: PURCHASES_URL,
        method: "GET",
        params: startDate && endDate ? { startDate, endDate } : {},
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Failed to fetch purchases:", response.message);
          throw new Error(response.message || "Error fetching purchases");
        }
        return response.data;
      },
      providesTags: ["Purchase"],
    }),

    getPurchaseById: builder.query({
      query: (id) => ({
        url: `${PURCHASES_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(`❌ Failed to fetch purchase ${id}:`, response.message);
          throw new Error(response.message || "Purchase not found");
        }
        return response.data;
      },
      providesTags: ["Purchase"],
    }),

    getPurchaseByBatchNumber: builder.query({
      query: (batchNumber) => ({
        url: `${PURCHASES_URL}/batch/${batchNumber}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to fetch purchase by batch ${batchNumber}:`,
            response.message
          );
          throw new Error(response.message || "Purchase not found");
        }
        return response.data;
      },
      providesTags: ["Purchase"],
    }),

    createPurchase: builder.mutation({
      query: (newPurchase) => ({
        url: PURCHASES_URL,
        method: "POST",
        body: newPurchase,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            "❌ Purchase creation failed:",
            response.errors || response.message
          );
          throw new Error(response.message || "Purchase creation failed");
        }
        return response.data;
      },
      invalidatesTags: ["Purchase"],
    }),

    getPurchasesByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: `${PURCHASES_URL}/bydate`,
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Purchase"],
    }),

    deletePurchase: builder.mutation({
      query: (purchaseId) => ({
        url: `${PURCHASES_URL}/${purchaseId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to delete purchase ${purchaseId}:`,
            response.message
          );
          throw new Error(response.message || "Error deleting purchase");
        }
        return response.data;
      },
      invalidatesTags: ["Purchase"],
    }),
  }),
});

export const {
  useGetAllPurchasesQuery,
  useGetPurchaseByIdQuery,
  useGetPurchaseByBatchNumberQuery,
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchasesByDateRangeQuery,
} = purchaseApiSlice;
