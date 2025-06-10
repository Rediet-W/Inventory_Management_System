import asyncHandler from "express-async-handler";
import * as purchaseService from "../services/purchaseService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

export const createPurchase = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      batchNumber,
      unitOfMeasurement,
      quantity,
      unitCost,
      purchaser,
      reference,
    } = req.body;

    const errors = [];

    if (!name) errors.push("Product name is required");
    if (!batchNumber) errors.push("Batch number is required");
    if (!unitOfMeasurement) errors.push("Unit of measurement is required");
    if (!quantity || isNaN(quantity) || quantity <= 0)
      errors.push("Quantity must be a valid number greater than 0");
    if (!unitCost || isNaN(unitCost) || unitCost <= 0)
      errors.push("Unit cost must be a valid number greater than 0");
    if (!purchaser) errors.push("Purchaser name is required");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid purchase input", null, errors);
    }

    const purchase = await purchaseService.createPurchase(req.body);

    sendResponse(res, true, "Purchase created successfully", purchase);
  } catch (error) {
    console.error("❌ Error creating purchase:", error);
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

// @desc    Get purchases by batch number
// @route   GET /api/purchases/batch/:batchNumber
// @access  Private (Authenticated users)
export const getPurchaseByBatchNumber = asyncHandler(async (req, res) => {
  try {
    const { batchNumber } = req.params;

    if (!batchNumber) {
      return sendResponse(res, false, "Batch number is required", null, [
        "Missing batch number",
      ]);
    }

    const purchases = await purchaseService.getPurchaseByBatchNumber(
      batchNumber
    );

    if (purchases.length === 0) {
      return sendResponse(res, false, "No purchases found", null, [
        `No purchases found with batch number: ${batchNumber}`,
      ]);
    }

    sendResponse(res, true, "Purchases retrieved successfully", purchases);
  } catch (error) {
    console.error("❌ Error fetching purchases by batch number:", error);
    sendResponse(res, false, "Failed to fetch purchases", null, [
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
export const getPurchaseByDateRange = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return sendResponse(
        res,
        false,
        "Start date and end date are required",
        null,
        ["Missing date range parameters"]
      );
    }

    const purchases = await purchaseService.getPurchaseByDateRange(
      startDate,
      endDate
    );
    sendResponse(res, true, "Purchases retrieved successfully", purchases);
  } catch (error) {
    console.error("❌ Error fetching purchases by date range:", error);
    sendResponse(res, false, "Failed to retrieve purchases", null, [
      error.message,
    ]);
  }
});

// @desc    Update a purchase
// @route   PUT /api/purchases/:id
// @access  Private (Admin only)
export const updatePurchase = asyncHandler(async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const {
      name,
      batchNumber,
      unitOfMeasurement,
      quantity,
      unitCost,
      purchaser,
      reference,
    } = req.body;

    const errors = [];

    // Input validation
    if (!name) errors.push("Product name is required");
    if (!batchNumber) errors.push("Batch number is required");
    if (!unitOfMeasurement) errors.push("Unit of measurement is required");
    if (!quantity || isNaN(quantity) || quantity <= 0)
      errors.push("Quantity must be a valid number greater than 0");
    if (!unitCost || isNaN(unitCost) || unitCost <= 0)
      errors.push("Unit cost must be a valid number greater than 0");
    if (!purchaser) errors.push("Purchaser name is required");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid purchase input", null, errors);
    }

    // Update the purchase
    const updatedPurchase = await purchaseService.updatePurchase(
      purchaseId,
      req.body
    );

    sendResponse(res, true, "Purchase updated successfully", updatedPurchase);
  } catch (error) {
    console.error("❌ Error updating purchase:", error);
    sendResponse(res, false, "Failed to update purchase", null, [
      error.message,
    ]);
  }
});
