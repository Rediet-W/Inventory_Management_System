import asyncHandler from "express-async-handler";
import * as saleService from "../services/saleService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

export const getAllSales = asyncHandler(async (req, res) => {
  try {
    const sales = await saleService.getAllSales();
    sendResponse(res, true, "Sales retrieved successfully", sales);
  } catch (error) {
    sendResponse(res, false, "Failed to retrieve sales", null, [error.message]);
  }
});

export const getSalesByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate)
    return sendResponse(res, false, "Both dates are required");

  const sales = await saleService.getSalesByDateRange(startDate, endDate);
  sendResponse(res, true, "Sales retrieved for date range", sales);
});

export const getSalesByBatchNumber = asyncHandler(async (req, res) => {
  try {
    const { batchNumber } = req.params;
    if (!batchNumber) {
      return sendResponse(res, false, "Batch number is required", null, [
        "Missing batch number",
      ]);
    }

    const sales = await saleService.getSalesByBatchNumber(batchNumber);

    if (sales.length === 0) {
      return sendResponse(res, false, "No sales found", null, [
        `No sales found for batch number: ${batchNumber}`,
      ]);
    }

    sendResponse(res, true, "Sales retrieved successfully", sales);
  } catch (error) {
    console.error("❌ Error fetching sales by batch number:", error);
    sendResponse(res, false, "Failed to fetch sales", null, [error.message]);
  }
});

export const getSalesByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) return sendResponse(res, false, "Date is required");

  const sales = await saleService.getSalesByDate(date);
  sendResponse(res, true, "Sales retrieved for the date", sales);
});

export const createSale = asyncHandler(async (req, res) => {
  const sale = await saleService.createSale(req.body);
  if (sale?.error)
    return sendResponse(res, false, "Failed to create sale", null, [
      sale.error,
    ]);

  sendResponse(res, true, "Sale created successfully", sale);
});

export const updateSale = asyncHandler(async (req, res) => {
  const sale = await saleService.updateSale(req.params.id, req.body.quantity);
  if (sale?.error)
    return sendResponse(res, false, "Sale update failed", null, [sale.error]);

  sendResponse(res, true, "Sale updated successfully", sale);
});

export const deleteSale = asyncHandler(async (req, res) => {
  const result = await saleService.deleteSale(req.params.id);
  sendResponse(
    res,
    result ? true : false,
    result ? "Sale deleted" : "Sale not found"
  );
});
