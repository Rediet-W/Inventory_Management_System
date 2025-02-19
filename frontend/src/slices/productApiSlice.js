import { apiSlice } from "./apiSlice";
const PRODUCTS_URL = "/api/products";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({
        url: PRODUCTS_URL,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Failed to fetch products:", response.message);
          throw new Error(response.message || "Failed to fetch products");
        }
        return response.data;
      },
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(`❌ Failed to fetch product ${id}:`, response.message);
          throw new Error(response.message || "Product not found");
        }
        return response.data;
      },
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            "❌ Product creation failed:",
            response.errors || response.message
          );
          throw new Error(response.message || "Product creation failed");
        }
        return response.data;
      },
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(`❌ Failed to update product ${id}:`, response.message);
          throw new Error(response.message || "Product update failed");
        }
        return response.data;
      },
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(`❌ Failed to delete product ${id}:`, response.message);
          throw new Error(response.message || "Product deletion failed");
        }
        return response.data;
      },
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApiSlice;
