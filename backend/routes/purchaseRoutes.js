import express from "express";
import {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  deletePurchase,
  getPurchaseByBatchNumber,
  getPurchaseByDateRange,
} from "../controllers/purchaseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, admin, createPurchase);

router.get("/", protect, getAllPurchases);
router.get("/bydate", protect, getPurchaseByDateRange);

router.get("/:id", protect, getPurchaseById);
router.get("/batch/:batchNumber", protect, getPurchaseByBatchNumber);
router.delete("/:id", protect, admin, deletePurchase);

export default router;
