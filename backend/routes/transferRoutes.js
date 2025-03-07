import express from "express";
import {
  getAllTransfers,
  getTransferByBatchNumber,
  createTransfer,
  deleteTransfer,
} from "../controllers/transferController.js";

import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllTransfers);

router.get("/batch/:batchNumber", protect, getTransferByBatchNumber);

router.post("/", protect, admin, createTransfer);

router.delete("/:id", protect, admin, deleteTransfer);

export default router;
