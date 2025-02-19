import asyncHandler from "express-async-handler";
import * as requestedProductService from "../services/requestedProductService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

// @desc    Get all requested products
// @route   GET /api/requested-products
// @access  Private (Authenticated users)
export const getRequestedProducts = asyncHandler(async (req, res) => {
  try {
    const requestedProducts =
      await requestedProductService.getAllRequestedProducts();
    sendResponse(
      res,
      true,
      "Requested products retrieved successfully",
      requestedProducts
    );
  } catch (error) {
    console.error("Error fetching requested products:", error);
    sendResponse(res, false, "Failed to retrieve requested products", null, [
      error.message,
    ]);
  }
});

// @desc    Create a new requested product
// @route   POST /api/requested-products
// @access  Private (Users)
export const createRequestedProduct = asyncHandler(async (req, res) => {
  try {
    const { product_name, description, quantity = 1 } = req.body;
    const errors = [];

    //  Input validation
    if (!product_name) errors.push("Product name is required");
    if (!description) errors.push("Description is required");
    if (quantity <= 0 || isNaN(quantity))
      errors.push("Quantity must be a valid number greater than 0");

    if (errors.length > 0) {
      return sendResponse(
        res,
        false,
        "Invalid input for requested product",
        null,
        errors
      );
    }

    const requestedProduct =
      await requestedProductService.createRequestedProduct(req.body);
    sendResponse(
      res,
      true,
      "Requested product created successfully",
      requestedProduct
    );
  } catch (error) {
    console.error("Error creating requested product:", error);
    sendResponse(res, false, "Failed to create requested product", null, [
      error.message,
    ]);
  }
});

// @desc    Update requested product quantity
// @route   PATCH /api/requested-products/:id
// @access  Private (Users)
export const updateRequestedProduct = asyncHandler(async (req, res) => {
  try {
    const { quantity } = req.body;
    const requestedProductId = req.params.id;
    const errors = [];

    if (!requestedProductId) errors.push("Requested product ID is required");
    if (!quantity || isNaN(quantity) || quantity <= 0)
      errors.push("Quantity must be a valid number greater than 0");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid update input", null, errors);
    }

    const requestedProduct =
      await requestedProductService.updateRequestedProduct(
        requestedProductId,
        quantity
      );
    if (requestedProduct) {
      sendResponse(
        res,
        true,
        "Requested product updated successfully",
        requestedProduct
      );
    } else {
      sendResponse(res, false, "Requested product not found", null, [
        "Invalid requested product ID",
      ]);
    }
  } catch (error) {
    console.error(" Error updating requested product:", error);
    sendResponse(res, false, "Failed to update requested product", null, [
      error.message,
    ]);
  }
});

// @desc    Delete a requested product
// @route   DELETE /api/requested-products/:id
// @access  Private (Users/Admins)
export const deleteRequestedProduct = asyncHandler(async (req, res) => {
  try {
    const requestedProductId = req.params.id;
    if (!requestedProductId) {
      return sendResponse(
        res,
        false,
        "Requested product ID is required",
        null,
        ["Missing requested product ID"]
      );
    }

    const result = await requestedProductService.deleteRequestedProduct(
      requestedProductId
    );
    if (result) {
      sendResponse(res, true, "Requested product deleted successfully");
    } else {
      sendResponse(res, false, "Requested product not found", null, [
        "Invalid requested product ID",
      ]);
    }
  } catch (error) {
    console.error(" Error deleting requested product:", error);
    sendResponse(res, false, "Failed to delete requested product", null, [
      error.message,
    ]);
  }
});
