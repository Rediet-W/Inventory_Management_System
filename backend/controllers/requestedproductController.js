import asyncHandler from "express-async-handler";
import RequestedProduct from "../models/requestedProductModel.js";

// @desc    Get all requested products
// @route   GET /api/requested-products
// @access  Private
const getRequestedProducts = asyncHandler(async (req, res) => {
  const requestedProducts = await RequestedProduct.findAll(); // Fetch all requested products
  res.json(requestedProducts);
});

// @desc    Create a requested product
// @route   POST /api/requested-products
// @access  Private
const createRequestedProduct = asyncHandler(async (req, res) => {
  const { product_name, description, quantity = 1 } = req.body;

  // Ensure both product and description are provided
  if (!product_name || !description) {
    res
      .status(400)
      .json({ message: "Please provide both product name and description." });
    return;
  }

  const requestedProduct = await RequestedProduct.create({
    product_name,
    description,
    quantity,
  });

  res.status(201).json({
    message: "Requested product created successfully",
    requestedProduct,
  });
});

// @desc    Delete a requested product
// @route   DELETE /api/requested-products/:id
// @access  Private
const deleteRequestedProduct = asyncHandler(async (req, res) => {
  const requestedProduct = await RequestedProduct.findByPk(req.params.id);

  if (!requestedProduct) {
    res.status(404).json({ message: "Requested product not found" });
    return;
  }

  await requestedProduct.destroy(); // Delete requested product

  res.json({ message: "Requested product removed successfully" });
});

// @desc    Update requested product quantity
// @route   PUT /api/requested-products/:id
// @access  Private
const updateRequestedProduct = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity) {
    res.status(400).json({ message: "Please provide a quantity" });
    return;
  }

  const requestedProduct = await RequestedProduct.findByPk(req.params.id);

  if (!requestedProduct) {
    res.status(404).json({ message: "Requested product not found" });
    return;
  }

  requestedProduct.quantity = quantity;
  await requestedProduct.save(); // Save updated quantity

  res.json({ message: "Requested product quantity updated successfully" });
});

export {
  getRequestedProducts,
  createRequestedProduct,
  deleteRequestedProduct,
  updateRequestedProduct,
};
