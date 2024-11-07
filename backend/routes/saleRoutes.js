import express from "express";
import {
  createSale,
  getSalesByDate,
  updateSale,
  deleteSale,
  getSalesByDateRange,
  getAllSales,
} from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Route to create a sale (authenticated users only)
router.route("/").post(protect, createSale).get(protect, getAllSales);

// Route to get sales by date (authenticated users only)
router.route("/date").get(protect, getSalesByDate); // Use '/date' for clarity

// Route to update a sale (admin only)
router.route("/:id").put(protect, admin, updateSale);

// Route to delete a sale (admin only)
router.route("/:id").delete(protect, admin, deleteSale);

// Route to get sales by date range
router.route("/range").get(protect, getSalesByDateRange);

export default router;
