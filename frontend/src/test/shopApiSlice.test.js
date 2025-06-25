import { configureStore } from "@reduxjs/toolkit";
import shopApiSlice from "../slices/shopApiSlice";
describe("shopApiSlice", () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { [shopApiSlice.reducerPath]: shopApiSlice.reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(shopApiSlice.middleware),
    });
  });

  test("fetches shop products successfully", async () => {
    const result = await store.dispatch(
      shopApiSlice.endpoints.getShopProducts.initiate()
    );
    expect(result.data).toEqual([{ id: 1, name: "Electronics Shop" }]);
  });
});
