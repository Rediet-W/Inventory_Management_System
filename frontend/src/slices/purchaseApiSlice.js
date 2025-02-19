import { apiSlice } from "./apiSlice"; // Reuse the base configuration from apiSlice

// Define the API slice for purchases
export const purchaseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch purchases by date range
    getPurchasesByDateRange: builder.query({
      query: ({ startDate, endDate }) =>
        `/api/purchases?startDate=${startDate}&endDate=${endDate}`,
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Failed to fetch purchases:", response.message);
          throw new Error(response.message || "Error fetching purchases");
        }
        return response.data;
      },
      providesTags: ["Purchase"],
    }),

    createPurchase: builder.mutation({
      query: (newPurchase) => ({
        url: "/api/purchases",
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

    deletePurchase: builder.mutation({
      query: (purchaseId) => ({
        url: `/api/purchases/${purchaseId}`,
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
  useGetPurchasesByDateRangeQuery,
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchaseApiSlice;
