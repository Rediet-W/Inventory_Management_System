import asyncHandler from "express-async-handler";
import * as transferService from "../services/transferService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

// @desc    Get all transfers (Optional date filtering)
// @route   GET /api/transfers
// @access  Private (Authenticated users)
export const getAllTransfers = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const transfers = await transferService.getAllTransfers(startDate, endDate);
    sendResponse(res, true, "Transfers retrieved successfully", transfers);
  } catch (error) {
    console.error("❌ Error fetching transfers:", error);
    sendResponse(res, false, "Failed to retrieve transfers", null, [
      error.message,
    ]);
  }
});

// @desc    Get transfer by batch number
// @route   GET /api/transfers/batch/:batchNumber
// @access  Private (Authenticated users)
export const getTransferByBatchNumber = asyncHandler(async (req, res) => {
  try {
    const { batchNumber } = req.params;

    if (!batchNumber) {
      return sendResponse(res, false, "Batch number is required", null, [
        "Missing batch number",
      ]);
    }

    const transfer = await transferService.getTransferByBatchNumber(
      batchNumber
    );

    if (!transfer.length) {
      return sendResponse(res, false, "No transfer record found", null, [
        `No transfers found for batch: ${batchNumber}`,
      ]);
    }

    sendResponse(
      res,
      true,
      "Transfer records retrieved successfully",
      transfer
    );
  } catch (error) {
    console.error("❌ Error fetching transfer by batch number:", error);
    sendResponse(res, false, "Failed to fetch transfer record", null, [
      error.message,
    ]);
  }
});

// @desc    Create a new transfer (Move product from store to shop)
// @route   POST /api/transfers
// @access  Private (Admin only)
export const createTransfer = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      batchNumber,
      quantity,
      sellingPrice,
      unitOfMeasurement,
      storeKeeper,
      reference,
    } = req.body;
    const errors = [];

    if (!name) errors.push("Product name is required");
    if (!batchNumber) errors.push("Batch number is required");
    if (!quantity || isNaN(quantity) || quantity <= 0)
      errors.push("Quantity must be a valid number greater than 0");
    if (!sellingPrice || isNaN(sellingPrice) || sellingPrice <= 0)
      errors.push("Selling price must be a valid number");
    if (!unitOfMeasurement) errors.push("Unit of measurement is required");
    if (!storeKeeper) errors.push("Store keeper name is required");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid transfer input", null, errors);
    }

    const transfer = await transferService.createTransfer(req.body);

    if (transfer?.error) {
      return sendResponse(res, false, "Failed to create transfer", null, [
        transfer.error,
      ]);
    }

    sendResponse(res, true, "Transfer recorded successfully", transfer);
  } catch (error) {
    console.error("❌ Error creating transfer:", error);
    sendResponse(res, false, "Failed to create transfer", null, [
      error.message,
    ]);
  }
});

// @desc    Delete a transfer record
// @route   DELETE /api/transfers/:id
// @access  Private (Admin only)
export const deleteTransfer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, false, "Transfer ID is required", null, [
        "Missing transfer ID",
      ]);
    }

    const result = await transferService.deleteTransfer(id);

    if (!result) {
      return sendResponse(res, false, "Transfer not found", null, [
        "Invalid transfer ID",
      ]);
    }

    sendResponse(res, true, "Transfer deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting transfer:", error);
    sendResponse(res, false, "Failed to delete transfer", null, [
      error.message,
    ]);
  }
});
