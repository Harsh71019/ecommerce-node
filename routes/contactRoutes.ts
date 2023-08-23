// routes/contactRoutes.js

import express from "express";
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  deleteContactMessage,
} from "../controllers/contactController.js";

const router = express.Router();

router.route("/").post(createContactMessage).get(getAllContactMessages);
router.route("/:id").get(getContactMessageById).delete(deleteContactMessage);

export default router;
