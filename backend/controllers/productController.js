import asyncHandler from "express-async-handler";
import * as productService from "../services/productService.js";

const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private (Authenticated users)
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    sendResponse(res, true, "Products retrieved successfully", products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    sendResponse(res, false, "Failed to fetch products", null, [error.message]);
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private (Authenticated users)
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return sendResponse(res, false, "Product ID is required", null, [
        "Missing product ID",
      ]);
    }

    const product = await productService.getProductById(productId);
    if (product) {
      sendResponse(res, true, "Product retrieved successfully", product);
    } else {
      sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }
  } catch (error) {
    console.error(" Error fetching product by ID:", error);
    sendResponse(res, false, "Failed to fetch product", null, [error.message]);
  }
});

// @desc    Get product by batch number
// @route   GET /api/products/batch/:batchNumber
// @access  Private (Authenticated users)
export const getProductByBatchNumber = asyncHandler(async (req, res) => {
  try {
    const { batchNumber } = req.params;

    if (!batchNumber) {
      return sendResponse(res, false, "Batch number is required", null, [
        "Missing batch number",
      ]);
    }

    const product = await productService.getProductByBatchNumber(batchNumber);
    if (product) {
      sendResponse(res, true, "Product retrieved successfully", product);
    } else {
      sendResponse(res, false, "Product not found", null, [
        `No product found with batch number: ${batchNumber}`,
      ]);
    }
  } catch (error) {
    console.error("❌ Error fetching product by batch number:", error);
    sendResponse(res, false, "Failed to fetch product", null, [error.message]);
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin only)
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      batchNumber,
      quantity,
      unitCost,
      unitOfMeasurement,
      reorderLevel,
    } = req.body;
    const errors = [];

    // 📌 Input validation
    if (!name) errors.push("Product name is required");
    if (!batchNumber) errors.push("Batch number is required");
    if (!quantity || isNaN(quantity) || quantity <= 0)
      errors.push("Quantity must be a valid positive number");
    if (!unitCost || isNaN(unitCost) || unitCost <= 0)
      errors.push("Unit cost must be a valid positive number");
    if (!unitOfMeasurement) errors.push("Unit of measurement is required");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid input", null, errors);
    }

    // 📌 Remove average cost calculation
    const finalReorderLevel = reorderLevel || 1;
    const sellingPrice = unitCost * 1.1; // Default markup

    // 📌 Create product (without average cost)
    const product = await productService.createProduct({
      name,
      batchNumber,
      quantity,
      unitCost,
      unitOfMeasurement,
      reorderLevel: finalReorderLevel,
      sellingPrice,
    });

    sendResponse(res, true, "Product created successfully", product);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    sendResponse(res, false, "Failed to create product", null, [error.message]);
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      batchNumber,
      quantity,
      unitCost,
      sellingPrice,
      unitOfMeasurement,
      remark,
      reorderLevel,
    } = req.body;
    const errors = [];

    // 📌 Check if product exists
    const product = await productService.getProductById(productId);
    if (!product) {
      return sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }

    // 📌 Input validation (only check if fields exist in request)
    if (name && name.trim() === "") errors.push("Product name cannot be empty");
    if (batchNumber && batchNumber.trim() === "")
      errors.push("Batch number cannot be empty");
    if (quantity !== undefined && (isNaN(quantity) || quantity <= 0))
      errors.push("Quantity must be a valid positive number");
    if (unitCost !== undefined && (isNaN(unitCost) || unitCost <= 0))
      errors.push("Unit cost must be a valid positive number");
    if (sellingPrice !== undefined && (isNaN(sellingPrice) || sellingPrice < 0))
      errors.push("Selling price must be a valid number");
    if (unitOfMeasurement && unitOfMeasurement.trim() === "")
      errors.push("Unit of measurement cannot be empty");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid input", null, errors);
    }

    // Prepare updated values (only update if provided)
    const updatedData = {
      ...(name && { name }),
      ...(batchNumber && { batchNumber }),
      ...(quantity !== undefined && { quantity }),
      ...(unitCost !== undefined && { unitCost }),
      ...(sellingPrice !== undefined && { sellingPrice }),
      ...(unitOfMeasurement && { unitOfMeasurement }),
      ...(remark && { remark }),
      ...(reorderLevel !== undefined && { reorderLevel }),
    };

    // If quantity or unitCost is updated, recalculate totalCost and averageCost
    if (quantity !== undefined || unitCost !== undefined) {
      const prevQuantity = product.quantity;
      const prevTotalCost = product.totalCost;

      const newQuantity = quantity !== undefined ? quantity : prevQuantity;
      const newUnitCost = unitCost !== undefined ? unitCost : product.unitCost;
      const newTotalCost = newQuantity * newUnitCost;

      // Calculate new average cost
      updatedData.totalCost = newTotalCost;
      updatedData.averageCost =
        (prevTotalCost + newTotalCost) / (prevQuantity + newQuantity);
    }

    // Perform update
    const updatedProduct = await productService.updateProduct(
      productId,
      updatedData
    );

    sendResponse(res, true, "Product updated successfully", updatedProduct);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    sendResponse(res, false, "Failed to update product", null, [error.message]);
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return sendResponse(res, false, "Product ID is required", null, [
        "Missing product ID",
      ]);
    }

    const result = await productService.deleteProduct(productId);
    if (result) {
      sendResponse(res, true, "Product deleted successfully");
    } else {
      sendResponse(res, false, "Product not found", null, [
        "Invalid product ID",
      ]);
    }
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    sendResponse(res, false, "Failed to delete product", null, [error.message]);
  }
});

// @desc    Get products within a date range
// @route   GET /api/products/date
// @access  Private (Authenticated users)
export const getProductsByDate = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const errors = [];

    if (!startDate || !endDate) {
      errors.push("Both startDate and endDate are required");
      return sendResponse(res, false, "Invalid input", null, errors);
    }

    const products = await productService.getProductsByDate(startDate, endDate);
    if (products.length > 0) {
      sendResponse(res, true, "Products retrieved successfully", products);
    } else {
      sendResponse(res, false, "No products found", null, [
        "No products within the given date range",
      ]);
    }
  } catch (error) {
    console.error("❌ Error fetching products by date range:", error);
    sendResponse(res, false, "Failed to fetch products", null, [error.message]);
  }
});
