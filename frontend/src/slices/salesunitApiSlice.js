import { apiSlice } from "./apiSlice";

export const saleUnitApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSaleUnits: builder.query({
      query: (productId) => ({
        url: `/api/sale-units/${productId}`,
        method: "GET",
      }),
      providesTags: ["SaleUnit"],
    }),
    // getSaleUnitsLazy: builder.query({
    //   query: (productId) => ({
    //     url: `/api/sale-units/${productId}`,
    //     method: "GET",
    //   }),
    // }),

    createSaleUnit: builder.mutation({
      query: ({ productId, ...data }) => ({
        url: `/api/sale-units/${productId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SaleUnit", "Product"],
    }),

    updateSaleUnit: builder.mutation({
      query: ({ unitId, ...data }) => ({
        url: `/api/sale-units/${unitId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SaleUnit", "Product"],
    }),

    deleteSaleUnit: builder.mutation({
      query: (unitId) => ({
        url: `/api/sale-units/${unitId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SaleUnit", "Product"],
    }),
  }),
});

export const {
  useGetSaleUnitsQuery,
  useLazyGetSaleUnitsQuery,
  useCreateSaleUnitMutation,
  useUpdateSaleUnitMutation,
  useDeleteSaleUnitMutation,
} = saleUnitApiSlice;
