import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  moveToCart,
} from '../controllers/wishlistController.js';

const router = express.Router();

router.route('/').post(protect, addToWishlist).get(protect, getWishlist);
router.route('/:productId').delete(protect, removeFromWishlist);
router.route('/:productId/moveToCart').post(protect, moveToCart);

export default router;
