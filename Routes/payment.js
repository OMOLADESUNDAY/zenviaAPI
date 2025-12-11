// paymentRoutes.js
import express from "express";
import {
  createPayment,
  confirmPayment,
  getAllPayments,
  getPayment,
  refundPayment
} from "../controllers/payment.js";

import { protect, adminProtect } from "../auth/auth.js";

const router = express.Router();

// ---------------- USER ROUTES ----------------

// User creates a new payment (Stripe)
router.post("/", protect, createPayment);

// User confirms payment after Stripe frontend
router.post("/confirm", protect, confirmPayment);

// ---------------- ADMIN ROUTES ----------------

// Get all payments with pagination & filters
router.get("/", adminProtect, getAllPayments);

// Get single payment by ID
router.get("/:id", adminProtect, getPayment);

// Refund a payment
router.patch("/:id/refund", adminProtect, refundPayment);

export default router;
