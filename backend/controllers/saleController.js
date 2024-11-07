import asyncHandler from "express-async-handler";
import Sale from "../models/saleModel.js";
import Shop from "../models/shopModel.js";
import { Op } from "sequelize";

// @desc    Get sales by date range
// @route   GET /api/sales/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private/User
const getSalesByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Validate the date inputs
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Both startDate and endDate are required" });
  }

  const sales = await Sale.findAll({
    where: {
      sale_date: {
        [Op.between]: [
          new Date(startDate).setHours(0, 0, 0, 0), // Start of the day
          new Date(endDate).setHours(23, 59, 59, 999), // End of the day
        ],
      },
    },
  });

  res.status(200).json(sales);
});

// @desc    Get sales for a specific date
// @route   GET /api/sales?date=YYYY-MM-DD
// @access  Private/User
const getSalesByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    res.status(400).json({ message: "Date is required" });
    return;
  }

  const sales = await Sale.findAll({
    where: {
      sale_date: {
        [Op.between]: [
          new Date(date).setHours(0, 0, 0, 0),
          new Date(date).setHours(23, 59, 59, 999),
        ],
      },
    },
  });

  res.status(200).json(sales);
});

// @desc    Create a new sale and update shop product quantity
// @route   POST /api/sales
// @access  Private/User
const createSale = asyncHandler(async (req, res) => {
  const { product_id, quantity_sold, user_name } = req.body;

  // Check if shopProductId is provided
  if (!product_id || !quantity_sold || !user_name) {
    res.status(400).json({
      message: "Shop product ID, quantity sold, and user name are required.",
    });
    return;
  }
  // by productid we mean shop product id
  // Find the product in the shop by ID (use the shop's 'id' not 'product_id')
  const shopProduct = await Shop.findByPk(product_id); // Find the shop product by its 'id'
  console.log(shopProduct, "shopProduct");
  if (!shopProduct) {
    res.status(404).json({ message: "Shop product not found" });
    return;
  }

  // Check if there is enough stock in the shop for the sale
  if (quantity_sold > shopProduct.quantity) {
    res.status(400).json({
      message: `Not enough stock available. Only ${shopProduct.quantity} units in stock.`,
    });
    return;
  }

  // Create a new sale
  const saleData = {
    product_id: shopProduct.id, // Link to the original product in the product table
    product_name: shopProduct.product_name,
    batch_number: shopProduct.batch_number,
    quantity_sold: quantity_sold,
    selling_price: shopProduct.selling_price,
    user_name: user_name,
    sale_date: new Date(),
  };
  console.log(saleData, "saleData");
  const sale = await Sale.create(saleData);
  console.log(sale, "ss");
  // Update the shop product quantity after sale
  const newQuantity = shopProduct.quantity - quantity_sold;
  console.log(newQuantity, "new quantity");
  if (newQuantity === 0) {
    // If the stock is zero, remove the product from the shop
    await shopProduct.destroy();
  } else {
    // Otherwise, update the shop product quantity
    shopProduct.quantity = newQuantity;
    await shopProduct.save();
  }
  console.log(shopProduct);

  res.status(201).json(sale);
});

// @desc    Update a sale (edit quantity or other details)
// @route   PUT /api/sales/:id
// @access  Private/Admin
const updateSale = asyncHandler(async (req, res) => {
  const { quantitySold } = req.body;

  // Find the sale entry by its ID
  const sale = await Sale.findByPk(req.params.id);
  if (!sale) {
    return res.status(404).json({ message: "Sale not found" });
  }

  // Find the associated shop product by its ID
  const shopProduct = await Shop.findByPk(sale.product_id);
  if (!shopProduct) {
    return res.status(404).json({ message: "Product not found in shop" });
  }

  // Calculate the quantity difference
  const quantityDifference = quantitySold - sale.quantity_sold;

  if (quantityDifference < 0) {
    // Reducing quantity: add the difference back to shop inventory
    shopProduct.quantity += Math.abs(quantityDifference);
  } else if (quantityDifference > 0) {
    // Increasing quantity: check if shop has enough stock
    if (shopProduct.quantity < quantityDifference) {
      return res.status(400).json({
        message: `Not enough stock available to increase the sale. Only ${shopProduct.quantity} units in stock.`,
      });
    }
    // Deduct the difference from shop inventory
    shopProduct.quantity -= quantityDifference;
  }

  // Save the updated shop product quantity
  await shopProduct.save();

  // Update the sale entry with the new quantity
  sale.quantity_sold = quantitySold;
  await sale.save();

  res.status(200).json(sale);
});

// @desc    Delete a sale
// @route   DELETE /api/sales/:id
// @access  Private/Admin
const deleteSale = asyncHandler(async (req, res) => {
  console.log(req.params.id, "id");
  const sale = await Sale.findByPk(req.params.id);
  console.log(sale, "sale");
  if (!sale) {
    res.status(404).json({ message: "Sale not found" });
    return;
  }

  // const shopProduct = await Shop.findByPk(sale.product_id);
  // if (!shopProduct) {
  //   res.status(404).json({ message: "Product not found" });
  //   return;
  // }

  // shopProduct.quantity += sale.quantity_sold;
  // await shopProduct.save();

  await sale.destroy();
  res.status(200).json({ message: "Sale deleted successfully" });
});

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/User
const getAllSales = asyncHandler(async (req, res) => {
  const sales = await Sale.findAll();
  res.status(200).json(sales);
});

export {
  createSale,
  getSalesByDate,
  updateSale,
  deleteSale,
  getSalesByDateRange,
  getAllSales,
};
