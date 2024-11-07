import express from "express";
import { getUsers } from "../controllers/userController.js"; // This should be implemented in the controller
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin can view all users
router.route("/").get(protect, admin, getUsers);

export default router;
