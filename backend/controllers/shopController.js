import asyncHandler from "express-async-handler";
import * as shopService from "../services/shopService.js";
import Shop from "../models/shopModel.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

export const getShopProducts = asyncHandler(async (req, res) => {
  try {
    const { start, end } = req.query;
    const products = await shopService.getShopProducts(start, end);
    sendResponse(res, true, "Shop products retrieved successfully", products);
  } catch (error) {
    console.error("❌ Error fetching shop products:", error);
    sendResponse(res, false, "Failed to retrieve shop products", null, [
      error.message,
    ]);
  }
});

export const getProductByBatchNumber = asyncHandler(async (req, res) => {
  try {
    const { batchNumber } = req.params;

    if (!batchNumber) {
      return sendResponse(res, false, "Batch number is required");
    }

    const product = await shopService.getProductByBatchNumber(batchNumber);

    if (!product) {
      return sendResponse(
        res,
        false,
        `No product found with batch number: ${batchNumber}`
      );
    }

    sendResponse(res, true, "Product retrieved successfully", product);
  } catch (error) {
    console.error("❌ Error fetching product by batch number:", error);
    sendResponse(res, false, "Failed to fetch product", null, [error.message]);
  }
});

export const getProductsByName = asyncHandler(async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return sendResponse(res, false, "Product name is required");
    }

    const products = await shopService.getProductsByName(name);

    if (!products.length) {
      return sendResponse(res, false, `No products found with name: ${name}`);
    }

    sendResponse(res, true, "Products retrieved successfully", products);
  } catch (error) {
    console.error("❌ Error fetching products by name:", error);
    sendResponse(res, false, "Failed to fetch products", null, [error.message]);
  }
});

export const addProductToShop = asyncHandler(async (req, res) => {
  try {
    const { name, batchNumber, quantity, sellingPrice, unitOfMeasurement } =
      req.body;
    const errors = [];

    if (!name) errors.push("Product name is required");
    if (!batchNumber) errors.push("Batch number is required");
    if (!quantity || isNaN(quantity) || quantity <= 0)
      errors.push("Quantity must be a valid number greater than 0");
    if (!sellingPrice || isNaN(sellingPrice) || sellingPrice <= 0)
      errors.push("Selling price must be a valid number");
    if (!unitOfMeasurement) errors.push("Unit of measurement is required");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid product data", null, errors);
    }

    const shopProduct = await shopService.addProductToShop(req.body);

    sendResponse(res, true, "Product added to shop successfully", shopProduct);
  } catch (error) {
    console.error("❌ Error adding product to shop:", error);
    sendResponse(res, false, "Failed to add product to shop", null, [
      error.message,
    ]);
  }
});

export const updateProductInShop = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, sellingPrice } = req.body;
    const errors = [];

    if (!id) errors.push("Product ID is required");
    if (quantity !== undefined && (isNaN(quantity) || quantity < 0))
      errors.push("Quantity must be a valid number");
    if (sellingPrice !== undefined && (isNaN(sellingPrice) || sellingPrice < 0))
      errors.push("Selling price must be a valid number");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid update data", null, errors);
    }

    const shopProduct = await shopService.updateProductInShop(id, req.body);

    if (!shopProduct) {
      return sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }

    sendResponse(res, true, "Product updated successfully", shopProduct);
  } catch (error) {
    console.error("❌ Error updating shop product:", error);
    sendResponse(res, false, "Failed to update shop product", null, [
      error.message,
    ]);
  }
});

export const deleteProductFromShop = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, false, "Product ID is required", null, [
        "Missing product ID parameter",
      ]);
    }

    const result = await shopService.deleteProductFromShop(id);

    if (!result) {
      return sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }

    sendResponse(res, true, "Product deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting shop product:", error);
    sendResponse(res, false, "Failed to delete product", null, [error.message]);
  }
});
