// paymentRoutes.js
import express from "express";
import {
  createPayment,
  stripeWebhook
} from "../controllers/payment.js";

import { protect } from "../auth/auth.js";

const router = express.Router();

// User creates a new payment (Stripe)
router.post("/create", protect, createPayment);

// User confirms payment after Stripe frontend
router.post("/webhook", protect, stripeWebhook);


export default router;
