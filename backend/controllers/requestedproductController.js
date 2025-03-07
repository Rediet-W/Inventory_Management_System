import asyncHandler from "express-async-handler";
import * as requestedProductService from "../services/requestedProductService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

// ✅ Get all requested products
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

// ✅ Create a requested product (supports status field)
export const createRequestedProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, quantity = 1, status = "pending" } = req.body;
    const errors = [];

    if (!name) errors.push("Product name is required");
    if (!description) errors.push("Description is required");
    if (quantity <= 0 || isNaN(quantity))
      errors.push("Quantity must be a valid number greater than 0");
    if (!["pending", "purchased", "fulfilled"].includes(status))
      errors.push("Invalid status value");

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

// ✅ Update requested product (quantity or status)
export const updateRequestedProduct = asyncHandler(async (req, res) => {
  try {
    const { quantity, status } = req.body;
    const requestedProductId = req.params.id;
    const errors = [];

    if (!requestedProductId) errors.push("Requested product ID is required");

    if (quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
      errors.push("Quantity must be a valid number greater than 0");
    }
    if (
      status !== undefined &&
      !["pending", "purchased", "fulfilled"].includes(status)
    ) {
      errors.push("Invalid status value");
    }

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid update input", null, errors);
    }

    const updatedProduct = await requestedProductService.updateRequestedProduct(
      requestedProductId,
      { quantity, status }
    );

    if (updatedProduct) {
      sendResponse(
        res,
        true,
        "Requested product updated successfully",
        updatedProduct
      );
    } else {
      sendResponse(res, false, "Requested product not found", null, [
        "Invalid requested product ID",
      ]);
    }
  } catch (error) {
    console.error("Error updating requested product:", error);
    sendResponse(res, false, "Failed to update requested product", null, [
      error.message,
    ]);
  }
});

// ✅ Delete a requested product
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
    console.error("Error deleting requested product:", error);
    sendResponse(res, false, "Failed to delete requested product", null, [
      error.message,
    ]);
  }
});
