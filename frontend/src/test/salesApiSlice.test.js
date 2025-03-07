import { setupServer } from "msw/node";
import { rest } from "msw";
import { configureStore } from "@reduxjs/toolkit";
import salesApiSlice from "../slices/salesApiSlice";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Mock API response
const server = setupServer(
  rest.get("/api/sales", (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, product_name: "Laptop", quantity_sold: 5 },
        { id: 2, product_name: "Mouse", quantity_sold: 2 },
      ])
    );
  })
);

// Start server before tests run
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("salesApiSlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { [salesApiSlice.reducerPath]: salesApiSlice.reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(salesApiSlice.middleware),
    });
  });

  test("fetches sales data successfully", async () => {
    const result = await store.dispatch(
      salesApiSlice.endpoints.getSalesByDateRange.initiate({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      })
    );

    expect(result.data).toEqual([
      { id: 1, product_name: "Laptop", quantity_sold: 5 },
      { id: 2, product_name: "Mouse", quantity_sold: 2 },
    ]);
  });

  test("handles API errors", async () => {
    server.use(
      rest.get("/api/sales", (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: "Internal Server Error" })
        );
      })
    );

    const result = await store.dispatch(
      salesApiSlice.endpoints.getSalesByDateRange.initiate({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      })
    );

    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(500);
  });
});
