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

router.get("/", protect, getShopProducts);

router.post("/", protect, admin, addProductToShop);

router.put("/:id", protect, admin, updateProductInShop);

router.delete("/:id", protect, admin, deleteProductFromShop);

export default router;
