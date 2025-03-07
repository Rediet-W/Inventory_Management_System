import React from "react";
import { Card } from "react-bootstrap";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import moment from "moment";

const BestSoldProducts = () => {
  // Get sales data for best sold products (last 1 month)
  const startDate = moment().subtract(1, "months").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");

  const {
    data: salesByRange,
    isLoading,
    error,
  } = useGetSalesByDateRangeQuery({ startDate, endDate });

  // Get top 6 best-sold products
  const getBestSoldProducts = () => {
    if (!salesByRange || salesByRange.length === 0) return [];

    // Aggregate sales by product name
    const productSales = salesByRange.reduce((acc, sale) => {
      const productName = sale.name;
      acc[productName] = (acc[productName] || 0) + sale.quantity;
      return acc;
    }, {});

    // Convert to array and sort by highest quantity sold
    return Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity) // Sort descending
      .slice(0, 6); // Take top 6
  };

  const bestSoldProducts = getBestSoldProducts();

  return (
    <Card className="shadow-sm p-3">
      <h5 className="text-primary">Best Sold Products</h5>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-danger">Error loading sales data</div>
      ) : bestSoldProducts.length === 0 ? (
        <div className="text-center text-muted">No sales data</div>
      ) : (
        bestSoldProducts.map((product, index) => (
          <div key={index}>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="fw-bold">{index + 1}.</span>
              <span>{product.name}</span>
              <span className="fw-bold">{product.quantity}</span>
            </div>
            {index !== bestSoldProducts.length - 1 && <hr className="my-1" />}
          </div>
        ))
      )}
    </Card>
  );
};

export default BestSoldProducts;
