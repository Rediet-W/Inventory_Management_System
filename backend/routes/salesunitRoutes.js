import express from "express";
import {
  getSaleUnits,
  createSaleUnit,
  updateSaleUnit,
  deleteSaleUnit,
} from "../controllers/salesunitController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router
  .route("/:productId")
  .get(protect, getSaleUnits)
  .post(protect, admin, createSaleUnit);

router
  .route("/:unitId")
  .put(protect, admin, updateSaleUnit)
  .delete(protect, admin, deleteSaleUnit);

export default router;
