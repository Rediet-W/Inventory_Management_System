import asyncHandler from "express-async-handler";
import * as purchaseService from "../services/purchaseService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

// @desc    Create a new purchase
// @route   POST /api/purchases
// @access  Private (Admin only)
export const createPurchase = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity, buyingPrice, purchaseDate } = req.body;
    const errors = [];

    // Input validation
    if (!productId) errors.push("Product ID is required");
    if (!quantity || isNaN(quantity) || quantity <= 0)
      errors.push("Quantity must be a valid number greater than 0");
    if (!buyingPrice || isNaN(buyingPrice) || buyingPrice <= 0)
      errors.push("Buying price must be a valid number greater than 0");
    if (!purchaseDate) errors.push("Purchase date is required");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid purchase input", null, errors);
    }

    const purchase = await purchaseService.createPurchase(req.body);

    if (purchase) {
      sendResponse(res, true, "Purchase created successfully", purchase);
    } else {
      sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }
  } catch (error) {
    console.error(" Error creating purchase:", error);
    sendResponse(res, false, "Failed to create purchase", null, [
      error.message,
    ]);
  }
});

// @desc    Get all purchases (with optional date filtering)
// @route   GET /api/purchases
// @access  Private (Authenticated users)
export const getAllPurchases = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const errors = [];

    if ((startDate && !endDate) || (!startDate && endDate)) {
      errors.push(
        "Both startDate and endDate are required together for filtering"
      );
    }

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid date range", null, errors);
    }

    const purchases = await purchaseService.getAllPurchases(startDate, endDate);
    sendResponse(res, true, "Purchases retrieved successfully", purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    sendResponse(res, false, "Failed to retrieve purchases", null, [
      error.message,
    ]);
  }
});

// @desc    Get a single purchase by ID
// @route   GET /api/purchases/:id
// @access  Private (Authenticated users)
export const getPurchaseById = asyncHandler(async (req, res) => {
  try {
    const purchaseId = req.params.id;
    if (!purchaseId) {
      return sendResponse(res, false, "Purchase ID is required", null, [
        "Missing purchase ID",
      ]);
    }

    const purchase = await purchaseService.getPurchaseById(purchaseId);
    if (purchase) {
      sendResponse(res, true, "Purchase retrieved successfully", purchase);
    } else {
      sendResponse(res, false, "Purchase not found", null, [
        "Invalid purchase ID",
      ]);
    }
  } catch (error) {
    console.error("Error fetching purchase:", error);
    sendResponse(res, false, "Failed to retrieve purchase", null, [
      error.message,
    ]);
  }
});

// @desc    Delete a purchase by ID
// @route   DELETE /api/purchases/:id
// @access  Private (Admin only)
export const deletePurchase = asyncHandler(async (req, res) => {
  try {
    const purchaseId = req.params.id;
    if (!purchaseId) {
      return sendResponse(res, false, "Purchase ID is required", null, [
        "Missing purchase ID",
      ]);
    }

    const result = await purchaseService.deletePurchase(purchaseId);
    if (result) {
      sendResponse(res, true, "Purchase deleted successfully");
    } else {
      sendResponse(res, false, "Purchase not found", null, [
        "Invalid purchase ID",
      ]);
    }
  } catch (error) {
    console.error("Error deleting purchase:", error);
    sendResponse(res, false, "Failed to delete purchase", null, [
      error.message,
    ]);
  }
});
