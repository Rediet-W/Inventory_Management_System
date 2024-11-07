import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the API slice for purchases
export const purchaseApiSlice = createApi({
  reducerPath: "purchaseApi", // Unique key to reference the API in the store
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }), // Base URL for API calls
  tagTypes: ["Purchase"], // Optional, used for cache invalidation
  endpoints: (builder) => ({
    // Fetch purchases by date range
    getPurchasesByDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return {
          url: `purchases?${params.toString()}`, // GET /api/purchases?startDate=...&endDate=...
          method: "GET",
        };
      },
      providesTags: ["Purchase"],
    }),

    // Create a new purchase
    createPurchase: builder.mutation({
      query: (newPurchase) => ({
        url: "purchases",
        method: "POST",
        body: newPurchase,
      }),
      invalidatesTags: ["Purchase"], // Invalidates cache to refetch purchases
    }),

    // Delete a purchase by ID
    deletePurchase: builder.mutation({
      query: (purchaseId) => ({
        url: `purchases/${purchaseId}`,
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
