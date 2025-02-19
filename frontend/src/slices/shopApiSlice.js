import { apiSlice } from "./apiSlice";

export const shopApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Fetch shop products
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

    // ✅ Add new shop item
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

    // ✅ Update a product in the shop
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

    // ✅ Delete a product from the shop
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
  useAddToShopMutation,
  useUpdateProductInShopMutation,
  useDeleteProductMutation,
} = shopApi;
