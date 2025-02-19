import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  admin,
  superAdmin,
  primaryAdmin,
} from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get("/", protect, admin, getAllUsers);

router.get("/admin/users", protect, admin, async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.delete("/:id", protect, admin, primaryAdmin, deleteUser);

export default router;
