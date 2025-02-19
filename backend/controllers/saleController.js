import asyncHandler from "express-async-handler";
import * as saleService from "../services/saleService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Authenticated users)
export const getAllSales = asyncHandler(async (req, res) => {
  try {
    const sales = await saleService.getAllSales();
    sendResponse(res, true, "Sales retrieved successfully", sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    sendResponse(res, false, "Failed to retrieve sales", null, [error.message]);
  }
});

// @desc    Get sales by date range
// @route   GET /api/sales/range
// @access  Private (Authenticated users)
export const getSalesByDateRange = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const errors = [];

    if (!startDate) errors.push("Start date is required");
    if (!endDate) errors.push("End date is required");

    if (errors.length > 0) {
      return sendResponse(
        res,
        false,
        "Invalid date range request",
        null,
        errors
      );
    }

    const sales = await saleService.getSalesByDateRange(startDate, endDate);
    sendResponse(res, true, "Sales retrieved for date range", sales);
  } catch (error) {
    console.error("Error fetching sales by date range:", error);
    sendResponse(res, false, "Failed to retrieve sales", null, [error.message]);
  }
});

// @desc    Get sales for a specific date
// @route   GET /api/sales/date
// @access  Private (Authenticated users)
export const getSalesByDate = asyncHandler(async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return sendResponse(res, false, "Date is required", null, [
        "Missing date query parameter",
      ]);
    }

    const sales = await saleService.getSalesByDate(date);
    sendResponse(res, true, "Sales retrieved for the date", sales);
  } catch (error) {
    console.error("Error fetching sales by date:", error);
    sendResponse(res, false, "Failed to retrieve sales", null, [error.message]);
  }
});

// @desc    Create a sale
// @route   POST /api/sales
// @access  Private (Users)
export const createSale = asyncHandler(async (req, res) => {
  try {
    const sale = await saleService.createSale(req.body);
    if (sale?.error) {
      return sendResponse(res, false, "Failed to create sale", null, [
        sale.error,
      ]);
    }

    sendResponse(res, true, "Sale created successfully", sale);
  } catch (error) {
    console.error("Error creating sale:", error);
    sendResponse(res, false, "Failed to create sale", null, [error.message]);
  }
});

// @desc    Update a sale
// @route   PATCH /api/sales/:id
// @access  Private (Users/Admins)
export const updateSale = asyncHandler(async (req, res) => {
  try {
    const { quantitySold } = req.body;
    const saleId = req.params.id;
    const errors = [];

    if (!saleId) errors.push("Sale ID is required");
    if (!quantitySold || isNaN(quantitySold) || quantitySold <= 0)
      errors.push("Quantity must be a valid number greater than 0");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid update input", null, errors);
    }

    const sale = await saleService.updateSale(saleId, quantitySold);
    if (sale?.error) {
      return sendResponse(res, false, "Sale update failed", null, [sale.error]);
    } else if (!sale) {
      return sendResponse(res, false, "Sale not found", null, [
        "Invalid sale ID",
      ]);
    }

    sendResponse(res, true, "Sale updated successfully", sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    sendResponse(res, false, "Failed to update sale", null, [error.message]);
  }
});

// @desc    Delete a sale
// @route   DELETE /api/sales/:id
// @access  Private (Users/Admins)
export const deleteSale = asyncHandler(async (req, res) => {
  try {
    const saleId = req.params.id;
    if (!saleId) {
      return sendResponse(res, false, "Sale ID is required", null, [
        "Missing sale ID parameter",
      ]);
    }

    const result = await saleService.deleteSale(saleId);
    if (result) {
      sendResponse(res, true, "Sale deleted successfully");
    } else {
      sendResponse(res, false, "Sale not found", null, ["Invalid sale ID"]);
    }
  } catch (error) {
    console.error("Error deleting sale:", error);
    sendResponse(res, false, "Failed to delete sale", null, [error.message]);
  }
});
