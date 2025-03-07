import { apiSlice } from "./apiSlice";

export const transferApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransfers: builder.query({
      query: () => "/api/transfers",
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Failed to fetch transfers:", response.message);
          throw new Error(response.message || "Error fetching transfers");
        }
        return response.data;
      },
      providesTags: ["Transfer"],
    }),

    getTransferByBatchNumber: builder.query({
      query: (batchNumber) => `/api/transfers/batch/${batchNumber}`,
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to fetch transfer for batch ${batchNumber}:`,
            response.message
          );
          throw new Error(response.message || "Error fetching transfer data");
        }
        return response.data;
      },
      providesTags: ["Transfer"],
    }),

    createTransfer: builder.mutation({
      query: (newTransfer) => ({
        url: "/api/transfers",
        method: "POST",
        body: newTransfer,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            "❌ Transfer creation failed:",
            response.errors || response.message
          );
          throw new Error(response.message || "Error creating transfer");
        }
        return response.data;
      },
      invalidatesTags: ["Transfer"],
    }),

    deleteTransfer: builder.mutation({
      query: (transferId) => ({
        url: `/api/transfers/${transferId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to delete transfer ${transferId}:`,
            response.message
          );
          throw new Error(response.message || "Error deleting transfer");
        }
        return response.data;
      },
      invalidatesTags: ["Transfer"],
    }),
  }),
});

export const {
  useGetAllTransfersQuery,
  useGetTransferByBatchNumberQuery,
  useCreateTransferMutation,
  useDeleteTransferMutation,
} = transferApiSlice;
