// routes/supportRoutes.js

import express from "express";
import {
  createSupportTicket,
  getAllSupportTickets,
  getSupportTicketById,
  updateSupportTicketStatus,
} from "../controllers/supportController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, createSupportTicket)
  .get(protect, admin, getAllSupportTickets);
router.route("/:id").get(protect, getSupportTicketById);
router.route("/:id/status").put(protect, admin, updateSupportTicketStatus);

export default router;
