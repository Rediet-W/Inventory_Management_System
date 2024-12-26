import { apiSlice } from "./apiSlice"; // Reuse the base configuration from apiSlice

// Define the API slice for purchases
export const purchaseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch purchases by date range
    getPurchasesByDateRange: builder.query({
      query: ({ startDate, endDate }) =>
        `/api/purchases?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Purchase"],
    }),

    // Create a new purchase
    createPurchase: builder.mutation({
      query: (newPurchase) => ({
        url: "/api/purchases",
        method: "POST",
        body: newPurchase,
      }),
      invalidatesTags: ["Purchase"], // Invalidates cache to refetch purchases
    }),

    // Delete a purchase by ID
    deletePurchase: builder.mutation({
      query: (purchaseId) => ({
        url: `/api/purchases/${purchaseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Purchase"], // Invalidates cache to refetch purchases
    }),
  }),
});

// Export the auto-generated hooks for the API slice
export const {
  useGetPurchasesByDateRangeQuery,
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchaseApiSlice;
