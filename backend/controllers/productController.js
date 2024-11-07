import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { Op } from "sequelize"; // Import Op from Sequelize
import Purchase from "../models/purchaseModel.js";
import Sale from "../models/saleModel.js";
// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll(); // Sequelize ORM method to get all products
  res.json(products);
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id); // Sequelize ORM method to get product by ID
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, quantity, buyingPrice, sellingPrice, batchNumber } = req.body;

  const product = await Product.create({
    name,
    quantity,
    buyingPrice,
    sellingPrice,
    batchNumber,
  });

  res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, quantity, buyingPrice, sellingPrice, batchNumber } = req.body;

  const product = await Product.findByPk(req.params.id); // Find product by ID

  if (product) {
    product.name = name;
    product.quantity = quantity;
    product.buyingPrice = buyingPrice;
    product.sellingPrice = sellingPrice;
    product.batchNumber = batchNumber;

    const updatedProduct = await product.save(); // Save the updated product
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id); // Find product by ID

  if (product) {
    // await Purchase.update(
    //   { product_id: null },
    //   { where: { product_id: req.params.id } }
    // );
    // await Sale.update(
    //   { product_id: null },
    //   { where: { product_id: req.params.id } }
    // );
    await product.destroy(); // Delete the product
    res.status(200).json({ message: "Product removed successfully" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// @desc    Get products by date range
// @route   GET /api/products?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private/User

const getProductsByDate = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  console.log("Start:", start, "End:", end);

  // Check if startDate and endDate are provided
  if (!startDate || !endDate) {
    res
      .status(400)
      .json({ message: "Please provide both startDate and endDate" });
    return;
  }

  // Ensure date filtering includes the full start and end dates
  const start = new Date(startDate).setHours(0, 0, 0, 0); // Start of the day
  const end = new Date(endDate).setHours(23, 59, 59, 999); // End of the day

  // Log for debugging (optional)

  // Fetch products by date range using 'created_at' since it's mapped in the model
  const products = await Product.findAll({
    where: {
      created_at: {
        [Op.between]: [start, end], // Use created_at since that's what Sequelize is using
      },
    },
  });

  if (products.length > 0) {
    res.status(200).json(products);
  } else {
    res
      .status(404)
      .json({ message: "No products found for the selected date range" });
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByDate,
};
