import asyncHandler from "express-async-handler";
import Shop from "../models/shopModel.js";
import Product from "../models/productModel.js";
import { Op } from "sequelize";

// @desc Get all products in shop or by date range
// @route GET /api/shop
// @desc Get all products in shop or by date range
// @route GET /api/shop
export const getShopProducts = asyncHandler(async (req, res) => {
  const { start, end } = req.query;

  // Prepare where clause for filtering by date
  const whereClause = {};

  if (start && end) {
    whereClause.date_added = {
      [Op.between]: [
        new Date(start).setHours(0, 0, 0, 0), // Start of the day
        new Date(end).setHours(23, 59, 59, 999), // End of the day
      ],
    };
  }

  // Fetch products with optional date filtering
  const products = await Shop.findAll({
    where: whereClause,
  });

  res.status(200).json(products);
});

// @desc Add a product to shop and deduct from store (product)
// @route POST /api/shop
export const addProductToShop = asyncHandler(async (req, res) => {
  const {
    productId,
    batchNumber,
    quantity,
    buyingPrice,
    sellingPrice,
    userName,
  } = req.body;

  const product = await Product.findByPk(productId);

  if (!product) {
    res.status(404).json({ message: "Product not found in the store" });
    return;
  }

  if (product.quantity < quantity) {
    res.status(400).json({ message: "Not enough stock available" });
    return;
  }

  // Deduct the quantity from the product stock
  product.quantity -= quantity;
  if (product.quantity === 0) {
    await product.destroy();
    res
      .status(200)
      .json({
        message:
          "Product added to shop and deleted from store as quantity is 0",
      });
  } else {
    await product.save();
  }

  // Add product to shop
  const shopProduct = await Shop.create({
    product_id: productId,
    product_name: product.name,
    batch_number: batchNumber,
    quantity,
    buying_price: product.buyingPrice,
    selling_price: sellingPrice,
    user_name: userName,
  });

  res.status(201).json(shopProduct);
});

// @desc Update a product in the shop
// @route PUT /api/shop/:id
export const updateProductInShop = asyncHandler(async (req, res) => {
  const { product_name, batch_number, quantity, selling_price, user_name } =
    req.body;

  const shopProduct = await Shop.findByPk(req.params.id);

  if (!shopProduct) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  shopProduct.product_name = product_name || shopProduct.product_name;
  shopProduct.batch_number = batch_number || shopProduct.batch_number;
  shopProduct.quantity = quantity || shopProduct.quantity;
  shopProduct.selling_price = selling_price || shopProduct.selling_price;
  shopProduct.user_name = user_name || shopProduct.user_name;

  if (shopProduct.quantity === 0) {
    await shopProduct.destroy();
    res.status(200).json({ message: "Product deleted as quantity is 0" });
  } else {
    await shopProduct.save();
    res.status(200).json(shopProduct);
  }
});

// @desc Delete a product from shop
// @route DELETE /api/shop/:id
export const deleteProductFromShop = asyncHandler(async (req, res) => {
  const shopProduct = await Shop.findByPk(req.params.id);

  if (!shopProduct) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  await shopProduct.destroy();
  res.status(200).json({ message: "Product removed from shop" });
});
