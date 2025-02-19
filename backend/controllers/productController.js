import asyncHandler from "express-async-handler";
import * as productService from "../services/productService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private (Authenticated users)
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    sendResponse(res, true, "Products retrieved successfully", products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    sendResponse(res, false, "Failed to fetch products", null, [error.message]);
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private (Authenticated users)
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return sendResponse(res, false, "Product ID is required", null, [
        "Missing product ID",
      ]);
    }

    const product = await productService.getProductById(productId);
    if (product) {
      sendResponse(res, true, "Product retrieved successfully", product);
    } else {
      sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }
  } catch (error) {
    console.error(" Error fetching product by ID:", error);
    sendResponse(res, false, "Failed to fetch product", null, [error.message]);
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin only)
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, buyingPrice, sellingPrice, batchNumber } = req.body;
    const errors = [];

    if (!name) errors.push("Product name is required");
    if (!batchNumber) errors.push("Batch number is required");
    if (!buyingPrice || isNaN(buyingPrice))
      errors.push("Buying price must be a valid number");
    if (!sellingPrice || isNaN(sellingPrice))
      errors.push("Selling price must be a valid number");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid input", null, errors);
    }

    const product = await productService.createProduct(req.body);
    sendResponse(res, true, "Product created successfully", product);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    sendResponse(res, false, "Failed to create product", null, [error.message]);
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, buyingPrice, sellingPrice, batchNumber } = req.body;
    const errors = [];
    // 📌 Input validation
    if (!name) errors.push("Product name is required");
    if (!batchNumber) errors.push("Batch number is required");
    if (!buyingPrice || isNaN(buyingPrice))
      errors.push("Buying price must be a valid number");
    if (!sellingPrice || isNaN(sellingPrice))
      errors.push("Selling price must be a valid number");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid input", null, errors);
    }

    const updatedProduct = await productService.updateProduct(
      productId,
      req.body
    );
    if (updatedProduct) {
      sendResponse(res, true, "Product updated successfully", updatedProduct);
    } else {
      sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }
  } catch (error) {
    console.error("❌ Error updating product:", error);
    sendResponse(res, false, "Failed to update product", null, [error.message]);
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return sendResponse(res, false, "Product ID is required", null, [
        "Missing product ID",
      ]);
    }

    const result = await productService.deleteProduct(productId);
    if (result) {
      sendResponse(res, true, "Product deleted successfully");
    } else {
      sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    sendResponse(res, false, "Failed to delete product", null, [error.message]);
  }
});

// @desc    Get products within a date range
// @route   GET /api/products/date
// @access  Private (Authenticated users)
export const getProductsByDate = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const errors = [];

    if (!startDate || !endDate) {
      errors.push("Both startDate and endDate are required");
      return sendResponse(res, false, "Invalid input", null, errors);
    }

    const products = await productService.getProductsByDate(startDate, endDate);
    if (products.length > 0) {
      sendResponse(res, true, "Products retrieved successfully", products);
    } else {
      sendResponse(res, false, "No products found", null, [
        "No products within the given date range",
      ]);
    }
  } catch (error) {
    console.error("❌ Error fetching products by date range:", error);
    sendResponse(res, false, "Failed to fetch products", null, [error.message]);
  }
});
