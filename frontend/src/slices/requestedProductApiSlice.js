import { apiSlice } from "./apiSlice";

const REQUESTED_PRODUCTS_URL = "/api/requested-products";

export const requestedProductApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRequestedProducts: builder.query({
      query: () => ({
        url: REQUESTED_PRODUCTS_URL,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            " Failed to fetch requested products:",
            response.message
          );
          throw new Error(
            response.message || "Error fetching requested products"
          );
        }
        return response.data;
      },
      providesTags: ["RequestedProduct"],
    }),

    createRequestedProduct: builder.mutation({
      query: (data) => ({
        url: REQUESTED_PRODUCTS_URL,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            " Failed to create requested product:",
            response.errors || response.message
          );
          throw new Error(
            response.message || "Requested product creation failed"
          );
        }
        return response.data;
      },
      invalidatesTags: ["RequestedProduct"],
    }),

    updateRequestedProduct: builder.mutation({
      query: ({ id, quantity }) => ({
        url: `${REQUESTED_PRODUCTS_URL}/${id}`,
        method: "PUT",
        body: { quantity },
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            ` Failed to update requested product ${id}:`,
            response.errors || response.message
          );
          throw new Error(
            response.message || "Requested product update failed"
          );
        }
        return response.data;
      },
      invalidatesTags: ["RequestedProduct"],
    }),

    deleteRequestedProduct: builder.mutation({
      query: (id) => ({
        url: `${REQUESTED_PRODUCTS_URL}/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            ` Failed to delete requested product ${id}:`,
            response.message
          );
          throw new Error(
            response.message || "Error deleting requested product"
          );
        }
        return response.data;
      },
      invalidatesTags: ["RequestedProduct"],
    }),
  }),
});

export const {
  useGetRequestedProductsQuery,
  useCreateRequestedProductMutation,
  useUpdateRequestedProductMutation,
  useDeleteRequestedProductMutation,
} = requestedProductApiSlice;
