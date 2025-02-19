import { apiSlice } from "./apiSlice";

export const summaryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesByDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        let url = "/api/sales/range";
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `${url}?${params.toString()}`;
      },
      transformResponse: (response) => {
        if (!response.success) {
          console.error("Failed to fetch sales summary:", response.message);
          throw new Error(response.message || "Error fetching sales summary");
        }
        return response.data;
      },
      providesTags: ["SalesSummary"],
    }),

    getPurchasesByDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        let url = "/api/purchases";
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `${url}?${params.toString()}`;
      },
      transformResponse: (response) => {
        if (!response.success) {
          console.error("Failed to fetch purchases summary:", response.message);
          throw new Error(
            response.message || "Error fetching purchases summary"
          );
        }
        return response.data;
      },
      providesTags: ["PurchasesSummary"],
    }),
  }),
});

export const { useGetSalesByDateRangeQuery, useGetPurchasesByDateRangeQuery } =
  summaryApiSlice;
