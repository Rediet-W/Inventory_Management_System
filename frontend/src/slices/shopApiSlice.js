import { apiSlice } from "./apiSlice";

export const shopApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch shop products
    getShopProducts: builder.query({
      query: () => "api/shop", // GET /api/shop
      transformResponse: (response) => {
        const allProducts = response;
        const lowStockProducts = response.filter(
          (product) => product.quantity < 3
        );
        return { allProducts, lowStockProducts };
      },
    }),
    // Add new shop item
    addToShop: builder.mutation({
      query: (newShopItem) => ({
        url: "/api/shop",
        method: "POST",
        body: newShopItem,
      }),
    }),
    // Update a product
    updateProduct: builder.mutation({
      query: ({ id, updatedProduct }) => ({
        url: `/api/shop/${id}`,
        method: "PUT",
        body: updatedProduct,
      }),
    }),
    // Delete a product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/shop/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetShopProductsQuery,
  useAddToShopMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = shopApi;
