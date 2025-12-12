import express from "express";
import { createPayment, stripeWebhook } from "../controllers/payment.js";
import { protect } from "../auth/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management (Stripe)
 */

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Create a new payment (Stripe)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order
 *               amount:
 *                 type: number
 *                 description: Total amount to be paid (in USD)
 *     responses:
 *       201:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 clientSecret:
 *                   type: string
 *                 paymentId:
 *                   type: string
 */
router.post("/create", protect, createPayment);

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Payments]
 *     description: Endpoint for Stripe to send payment status updates (succeeded/failed)
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post("/webhook", protect, stripeWebhook);

export default router;
