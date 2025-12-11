// paymentController.js
import Payment from "../model/Payment.js";
import { ApiError } from "../utils/errorHandler.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= CREATE PAYMENT (USER) =================
export const createPayment = async (req, res) => {
  const { orderId, amount, paymentMethod } = req.body;

  if (!orderId || !amount || !paymentMethod) {
    throw new ApiError("All fields are required", 400);
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // amount in cents
    currency: "usd",
    payment_method_types: [paymentMethod], // e.g., "card"
    metadata: { orderId, userId: req.user._id.toString() },
  });

  // Save payment in DB with pending status
  const payment = await Payment.create({
    user: req.user._id,
    order: orderId,
    amount,
    paymentMethod,
    transactionId: paymentIntent.id,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentId: payment._id,
  });
};

// ================= CONFIRM PAYMENT (USER) =================
export const confirmPayment = async (req, res) => {
  const { paymentId } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError("Payment not found", 404);

  const intent = await stripe.paymentIntents.retrieve(payment.transactionId);

  if (intent.status === "succeeded") {
    payment.status = "completed";
    await payment.save();
  }

  res.json({ success: true, data: payment });
};

// ================= GET ALL PAYMENTS (ADMIN) =================
export const getAllPayments = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};

  // Optional filters
  if (req.query.user) filter.user = req.query.user;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

  const total = await Payment.countDocuments(filter);

  const payments = await Payment.find(filter)
    .populate("user", "name email")
    .populate("order")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: payments,
  });
};

// ================= GET SINGLE PAYMENT =================
export const getPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate("user", "name email")
    .populate("order");

  if (!payment) throw new ApiError("Payment not found", 404);

  res.json({ success: true, data: payment });
};

// ================= REFUND PAYMENT (ADMIN) =================
export const refundPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError("Payment not found", 404);

  if (payment.refunded) throw new ApiError("Payment has already been refunded", 400);

  // Optionally, refund via Stripe
  if (payment.transactionId) {
    await stripe.refunds.create({ payment_intent: payment.transactionId });
  }

  payment.refunded = true;
  payment.status = "failed"; // mark as refunded
  await payment.save();

  res.json({ success: true, message: "Payment refunded successfully", data: payment });
};
