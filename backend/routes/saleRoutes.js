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

router.route("/").post(protect, createSale).get(protect, getAllSales);

router.route("/date").get(protect, getSalesByDate);

router.route("/:id").put(protect, admin, updateSale);

router.route("/:id").delete(protect, admin, deleteSale);

router.route("/range").get(protect, getSalesByDateRange);

export default router;
