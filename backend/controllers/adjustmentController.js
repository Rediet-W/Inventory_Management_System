import Adjustment from "../models/adjustmentModel.js";
import * as adjustmentService from "../services/adjustmentService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};
export const createAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.create(req.body);
    sendResponse(res, true, "Adjustment created successfully", adjustment);
  } catch (err) {
    sendResponse(res, false, "Failed to create adjustment", null, [
      err.message,
    ]);
  }
};

export const getAdjustments = async (req, res) => {
  try {
    const adjustments = await Adjustment.findAll();
    sendResponse(res, true, "Adjustments fetched successfully", adjustments);
  } catch (err) {
    sendResponse(res, false, "Failed to fetch adjustments", null, [
      err.message,
    ]);
  }
};

export const approveAdjustment = async (req, res) => {
  const id = req.params.id;
  const approver = req.body.approvedBy;
  const result = await adjustmentService.processAdjustment(id, approver);

  if (result.error) {
    return sendResponse(res, false, result.error, null, [result.error]);
  }
  sendResponse(res, true, "Adjustment approved successfully", result);
};

export const rejectAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.findByPk(req.params.id);
    if (!adjustment || adjustment.status !== "pending") {
      return sendResponse(res, false, "Not found or already processed", null, [
        "Not found or already processed",
      ]);
    }

    adjustment.status = "rejected";
    adjustment.approvedBy = req.body.approvedBy;
    await adjustment.save();

    sendResponse(res, true, "Adjustment rejected successfully", adjustment);
  } catch (err) {
    sendResponse(res, false, "Failed to reject adjustment", null, [
      err.message,
    ]);
  }
};
