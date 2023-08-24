import express from 'express';
import {
  createOrder,
  getOrderById,
  updateTransitStatus,
  getAllOrders,
  markOrderAsDelivered,
  getMyOrders,
  getDetailedAnalytics,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/transit').put(protect, admin, updateTransitStatus);
router.route('/:id/deliver').put(protect, admin, markOrderAsDelivered);
router.route('/analytics/details').get(protect, admin, getDetailedAnalytics);

export default router;
