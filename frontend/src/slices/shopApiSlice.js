import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const shopApi = createApi({
  reducerPath: "shopApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getShopProducts: builder.query({
      query: () => "/shop",
      transformResponse: (response) => {
        const allProducts = response;
        const lowStockProducts = response.filter(
          (product) => product.quantity < 3
        );
        return { allProducts, lowStockProducts };
      },
    }),
    addToShop: builder.mutation({
      query: (newShopItem) => ({
        url: "/shop",
        method: "POST",
        body: newShopItem,
      }),
    }),
    // Add mutation for updating a product
    updateProduct: builder.mutation({
      query: ({ id, updatedProduct }) => ({
        url: `/shop/${id}`,
        method: "PUT",
        body: updatedProduct,
      }),
    }),
    // Add mutation for deleting a product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/shop/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetShopProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddToShopMutation,
} = shopApi;
