import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  moveToWishlist,
} from "../controllers/cartController.js";

const router = express.Router();

router.route("/").post(protect, addToCart).get(protect, getCart);
router.route("/:productId").delete(protect, removeFromCart);
router.route("/:productId/moveToWishlist").post(protect, moveToWishlist);

export default router;
