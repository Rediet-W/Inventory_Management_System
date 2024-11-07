import asyncHandler from "express-async-handler";
import Purchase from "../models/purchaseModel.js";
import Product from "../models/productModel.js";
import { Op } from "sequelize"; // Import Sequelize operators

// @desc    Create a new purchase
// @route   POST /api/purchases
// @access  Private (admin only)
const createPurchase = asyncHandler(async (req, res) => {
  const { productId, quantity, buyingPrice, purchaseDate, userName } = req.body;

  const product = await Product.findByPk(productId); // Use Sequelize to find product by ID

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  // Create a new purchase
  const purchase = await Purchase.create({
    product_id: productId,
    product_name: product.name,
    quantity,
    buying_price: buyingPrice,
    purchase_date: purchaseDate,
    user_name: userName,
  });

  // Update the product quantity
  product.quantity += quantity;
  await product.save();

  res.status(201).json({ message: "Purchase created successfully", purchase });
});

// @desc    Get all purchases (optionally filter by date range)
// @route   GET /api/purchases
// @access  Private
const getAllPurchases = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Prepare where clause for filtering by date
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.purchase_date = {
      [Op.between]: [
        new Date(startDate).setHours(0, 0, 0, 0), // Start of the day
        new Date(endDate).setHours(23, 59, 59, 999), // End of the day
      ],
    };
  }

  // Fetch purchases with optional date filtering
  const purchases = await Purchase.findAll({
    where: whereClause,
  });

  res.status(200).json(purchases);
});

// @desc    Get purchase by ID
// @route   GET /api/purchases/:id
// @access  Private
const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findByPk(req.params.id);

  if (!purchase) {
    res.status(404).json({ message: "Purchase not found" });
  } else {
    res.status(200).json(purchase);
  }
});

// @desc    Delete a purchase
// @route   DELETE /api/purchases/:id
// @access  Private (admin only)
const deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findByPk(req.params.id);

  if (!purchase) {
    res.status(404).json({ message: "Purchase not found" });
    return;
  }

  const product = await Product.findByPk(purchase.product_id);

  if (product) {
    product.quantity -= purchase.quantity;
    await product.save();
  }

  await purchase.destroy(); // Delete the purchase

  res.json({ message: "Purchase deleted successfully" });
});

export { createPurchase, getAllPurchases, getPurchaseById, deletePurchase };
