import { apiSlice } from "./apiSlice";
export const shopApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShopProducts: builder.query({
      query: ({ start, end } = {}) => {
        const queryParams = start && end ? `?start=${start}&end=${end}` : "";
        return `/api/shop${queryParams}`;
      },
      transformResponse: (response) => {
        if (!response.success) {
          console.error("❌ Failed to fetch shop products:", response.message);
          throw new Error(response.message || "Error fetching shop products");
        }

        const allProducts = response.data;
        const lowStockProducts = response.data.filter(
          (product) => product.quantity < 3
        );

        return { allProducts, lowStockProducts };
      },
      providesTags: ["Shop"],
    }),

    getProductByBatchNumber: builder.query({
      query: (batchNumber) => `/api/shop/batch/${batchNumber}`,
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to fetch product with batch number ${batchNumber}:`,
            response.message
          );
          throw new Error(
            response.message || "Error fetching product by batch"
          );
        }
        return response.data;
      },
      providesTags: ["Shop"],
    }),

    getProductsByName: builder.query({
      query: (name) => `/api/shop/name/${name}`,
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to fetch products with name ${name}:`,
            response.message
          );
          throw new Error(
            response.message || "Error fetching products by name"
          );
        }
        return response.data;
      },
      providesTags: ["Shop"],
    }),

    addToShop: builder.mutation({
      query: (newShopItem) => ({
        url: "/api/shop",
        method: "POST",
        body: newShopItem,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            "❌ Failed to add product to shop:",
            response.errors || response.message
          );
          throw new Error(response.message || "Error adding product");
        }
        return response.data;
      },
      invalidatesTags: ["Shop"],
    }),

    updateProductInShop: builder.mutation({
      query: ({ id, updatedProduct }) => ({
        url: `/api/shop/${id}`,
        method: "PUT",
        body: updatedProduct,
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(
            `❌ Failed to update product ${id}:`,
            response.errors || response.message
          );
          throw new Error(response.message || "Error updating product");
        }
        return response.data;
      },
      invalidatesTags: ["Shop"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/shop/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          console.error(`❌ Failed to delete product ${id}:`, response.message);
          throw new Error(response.message || "Error deleting product");
        }
        return response.data;
      },
      invalidatesTags: ["Shop"],
    }),
  }),
});

export const {
  useGetShopProductsQuery,
  useGetProductByBatchNumberQuery,
  useGetProductsByNameQuery,
  useAddToShopMutation,
  useUpdateProductInShopMutation,
  useDeleteProductMutation,
} = shopApi;
