import express from 'express';
const router = express.Router();
import {
  getSettings,
  updateSettings,
} from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Routes
router.route('/').get(getSettings).put(protect, admin, updateSettings);

export default router;
