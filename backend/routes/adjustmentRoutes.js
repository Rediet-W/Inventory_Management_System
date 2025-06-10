import express from "express";
import {
  createAdjustment,
  getAdjustments,
  approveAdjustment,
  rejectAdjustment,
} from "../controllers/adjustmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createAdjustment);
router.get("/", protect, getAdjustments);
router.patch("/:id/approve", protect, admin, approveAdjustment);
router.patch("/:id/reject", protect, admin, rejectAdjustment);

export default router;
