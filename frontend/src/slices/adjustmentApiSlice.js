import { apiSlice } from "./apiSlice";

const ADJUSTMENTS_URL = "/api/adjustments";

export const adjustmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdjustments: builder.query({
      query: () => ({
        url: ADJUSTMENTS_URL,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Failed to fetch adjustments:", response.message);
          throw new Error(response.message || "Failed to fetch adjustments");
        }
        return response.data;
      },
      providesTags: ["Adjustment"],
    }),

    createAdjustment: builder.mutation({
      query: (data) => ({
        url: ADJUSTMENTS_URL,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            "❌ Adjustment creation failed from the slice:",
            response.message
          );
          throw new Error(response.message || "Adjustment creation failed");
        }
        return response.success;
      },
      invalidatesTags: ["Adjustment"],
    }),

    approveAdjustment: builder.mutation({
      query: ({ id, approvedBy }) => ({
        url: `${ADJUSTMENTS_URL}/${id}/approve`,
        method: "PATCH",
        body: { approvedBy },
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Approval failed:", response.message);
          throw new Error(response.message || "Approval failed");
        }
        return response.data;
      },
      invalidatesTags: ["Adjustment"],
    }),

    rejectAdjustment: builder.mutation({
      query: ({ id, approvedBy }) => ({
        url: `${ADJUSTMENTS_URL}/${id}/reject`,
        method: "PATCH",
        body: { approvedBy },
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Rejection failed:", response.message);
          throw new Error(response.message || "Rejection failed");
        }
        return response.data;
      },
      invalidatesTags: ["Adjustment"],
    }),
  }),
});

export const {
  useGetAdjustmentsQuery,
  useCreateAdjustmentMutation,
  useApproveAdjustmentMutation,
  useRejectAdjustmentMutation,
} = adjustmentApiSlice;
