import express from "express";
import {
  getProducts,
  getProductById,
  getProductByBatchNumber,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByDate,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.route("/byDate").get(protect, getProductsByDate);

router.route("/batch/:batchNumber").get(getProductByBatchNumber);

router.route("/").get(getProducts).post(protect, admin, createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
