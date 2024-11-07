import express from "express";
const router = express.Router();
import {
  getShopProducts,
  addProductToShop,
  updateProductInShop,
  deleteProductFromShop,
} from "../controllers/shopController.js";

import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

// Get all products in shop, or filter by date range
router.get("/", protect, getShopProducts);

// Add a product to the shop
router.post("/", protect, admin, addProductToShop);

// Update a product in the shop
router.put("/:id", protect, admin, updateProductInShop);

// Delete a product from the shop
router.delete("/:id", protect, admin, deleteProductFromShop);

export default router;
