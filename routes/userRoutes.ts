import express from "express";
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  resetPassword,
  requestPasswordReset,
  getUserById,
  getAdminDashboard,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authUser);
router.post("/register", registerUser);
router.post("/reset-password", requestPasswordReset); // Add this line

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route("/").get(protect, admin, getUsers);
router.route("/:id").delete(protect, admin, deleteUser);
router.post("/reset-password/:token", resetPassword);
router.get("/:id", protect, admin, getUserById);
router.get("/dashboard/users", protect, admin, getAdminDashboard);

export default router;
