import asyncHandler from "express-async-handler";
import * as saleUnitService from "../services/salesunitService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

export const getSaleUnits = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.productId;
    const saleUnits = await saleUnitService.getSaleUnitsByProductId(productId);
    sendResponse(res, true, "Sale units retrieved successfully", saleUnits);
  } catch (error) {
    sendResponse(res, false, "Failed to retrieve sale units", null, [
      error.message,
    ]);
  }
});

export const createSaleUnit = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.productId;
    const saleUnit = await saleUnitService.createSaleUnit(productId, req.body);
    sendResponse(res, true, "Sale unit created successfully", saleUnit);
  } catch (error) {
    sendResponse(res, false, "Failed to create sale unit", null, [
      error.message,
    ]);
  }
});

export const updateSaleUnit = asyncHandler(async (req, res) => {
  try {
    const unitId = req.params.unitId;
    const updated = await saleUnitService.updateSaleUnit(unitId, req.body);
    sendResponse(res, true, "Sale unit updated successfully", updated);
  } catch (error) {
    sendResponse(res, false, "Failed to update sale unit", null, [
      error.message,
    ]);
  }
});

export const deleteSaleUnit = asyncHandler(async (req, res) => {
  try {
    const unitId = req.params.unitId;
    const deleted = await saleUnitService.deleteSaleUnit(unitId);
    sendResponse(res, true, "Sale unit deleted", deleted);
  } catch (error) {
    sendResponse(res, false, "Failed to delete sale unit", null, [
      error.message,
    ]);
  }
});
