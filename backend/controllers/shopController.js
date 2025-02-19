import asyncHandler from "express-async-handler";
import * as shopService from "../services/shopService.js";
import Shop from "../models/shopModel.js";
import { Op } from "sequelize";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

// @desc    Get shop products within a date range
// @route   GET /api/shop
// @access  Private (Authenticated users)
export const getShopProducts = asyncHandler(async (req, res) => {
  try {
    const { start, end } = req.query;

    // ✅ Allow fetching all products if no dates are provided
    const whereClause =
      start && end
        ? {
            date_added: {
              [Op.between]: [
                new Date(start).setHours(0, 0, 0, 0),
                new Date(end).setHours(23, 59, 59, 999),
              ],
            },
          }
        : {};

    const products = await Shop.findAll({ where: whereClause });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("❌ Error fetching shop products:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve shop products" });
  }
});

// @desc    Add a product to the shop
// @route   POST /api/shop
// @access  Private (Admin)
export const addProductToShop = asyncHandler(async (req, res) => {
  try {
    const { name, quantity, buyingPrice, sellingPrice } = req.body;
    const errors = [];

    if (!name) errors.push("Product name is required");
    if (!quantity || isNaN(quantity) || quantity <= 0)
      errors.push("Quantity must be a valid number greater than 0");
    if (!buyingPrice || isNaN(buyingPrice) || buyingPrice <= 0)
      errors.push("Buying price must be a valid number");
    if (!sellingPrice || isNaN(sellingPrice) || sellingPrice <= 0)
      errors.push("Selling price must be a valid number");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid product data", null, errors);
    }

    const shopProduct = await shopService.addProductToShop(req.body);

    if (shopProduct.error) {
      return sendResponse(res, false, "Failed to add product to shop", null, [
        shopProduct.error,
      ]);
    }

    sendResponse(res, true, "Product added to shop successfully", shopProduct);
  } catch (error) {
    console.error("Error adding product to shop:", error);
    sendResponse(res, false, "Failed to add product to shop", null, [
      error.message,
    ]);
  }
});

// @desc    Update a product in the shop
// @route   PATCH /api/shop/:id
// @access  Private (Admin)
export const updateProductInShop = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, selling_price } = req.body;
    const errors = [];
    console.log(req.body, "from controller");
    if (!id) errors.push("Product ID is required");
    if (quantity !== undefined && (isNaN(quantity) || quantity < 0))
      errors.push("Quantity must be a valid number");
    if (
      selling_price !== undefined &&
      (isNaN(selling_price) || selling_price < 0)
    )
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
    console.error("Error updating shop product:", error);
    sendResponse(res, false, "Failed to update shop product", null, [
      error.message,
    ]);
  }
});

// @desc    Delete a product from the shop
// @route   DELETE /api/shop/:id
// @access  Private (Admin)
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
    console.error("Error deleting shop product:", error);
    sendResponse(res, false, "Failed to delete product", null, [error.message]);
  }
});
