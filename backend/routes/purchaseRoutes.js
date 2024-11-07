import express from "express";
import {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  deletePurchase,
} from "../controllers/purchaseController.js";
import { protect } from "../middleware/authMiddleware.js"; // Ensure only authenticated users access these routes
import { admin } from "../middleware/adminMiddleware.js"; // Ensure only admins can create and delete purchases

const router = express.Router();

// @route   POST /api/purchases
// @desc    Create a new purchase
// @access  Private (admin only)
router.post("/", protect, admin, createPurchase); // Added protect and admin middlewares

// @route   GET /api/purchases
// @desc    Get all purchases (with optional date range filter)
// @access  Private
router.get("/", protect, getAllPurchases); // Added protect middleware

// @route   GET /api/purchases/:id
// @desc    Get purchase by ID
// @access  Private
router.get("/:id", protect, getPurchaseById); // Added protect middleware

// @route   DELETE /api/purchases/:id
// @desc    Delete a purchase
// @access  Private (admin only)
router.delete("/:id", protect, admin, deletePurchase); // Added protect and admin middlewares

export default router;
