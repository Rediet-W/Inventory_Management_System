import { configureStore } from "@reduxjs/toolkit";
import summaryApiSlice from "../slices/summaryApiSlice";

describe("summaryApiSlice", () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { [summaryApiSlice.reducerPath]: summaryApiSlice.reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(summaryApiSlice.middleware),
    });
  });

  test("fetches summary data successfully", async () => {
    const result = await store.dispatch(
      summaryApiSlice.endpoints.getSalesByDateRange.initiate({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      })
    );
    expect(result.data).toEqual([
      { id: 1, product_name: "Laptop", quantity_sold: 5 },
      { id: 2, product_name: "Mouse", quantity_sold: 2 },
    ]);
  });
});
