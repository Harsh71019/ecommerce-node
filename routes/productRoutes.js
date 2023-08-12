import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  updateProductReview,
  deleteProductReview,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

//Common
router.route('/').post(protect, admin, createProduct).get(getProducts);

//For admin
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Product review routes
router.route('/:id/reviews').post(protect, addProductReview);
router
  .route('/:id/reviews/:reviewId')
  .put(protect, updateProductReview)
  .delete(protect, deleteProductReview);

export default router;
