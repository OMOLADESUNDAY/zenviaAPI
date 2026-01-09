import Payment from "../model/Payment.js";
import Order from "../model/Order.js";
import { ApiError } from "../utils/errorHandler.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= CREATE PAYMENT (USER) =================
export const createPayment = async (req, res) => {
  const { orderId } = req.body;  

  if (!orderId) {
    throw new ApiError("Order ID is required", 400);
  }

  // ✅ Load the order from DB to verify amount
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  if (order.isPaid) {
    throw new ApiError("Order is already paid", 400);
  }

  const amount = order.totalPrice;

  // Create Stripe PaymentIntent with DB-verified amount
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // amount in cents
    currency: "usd",
    payment_method_types: ["card"], // only allow card for security
    metadata: { orderId, userId: req.user._id.toString() },
  });

  // Create Payment record in DB
  const payment = await Payment.create({
    user: req.user._id,
    order: orderId,
    amount,
    paymentMethod: "card",
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentId: payment._id,
  });
};

// ================= STRIPE WEBHOOK =================
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  switch (event.type) {
    case "payment_intent.succeeded":
      // Payment succeeded
      const payment = await Payment.findOne({ stripePaymentIntentId: data.id });
      if (payment) {
        payment.status = "completed";
        await payment.save();

        // Update the associated Order
        const order = await Order.findById(payment.order);
        if (order) {
          order.isPaid = true;
          order.status = "paid";
          order.paidAt = new Date();
          order.stripePaymentIntentId = data.id;
          await order.save();
        }
      }
      break;

    case "payment_intent.payment_failed":
      // Payment failed
      const failedPayment = await Payment.findOne({ stripePaymentIntentId: data.id });
      if (failedPayment) {
        failedPayment.status = "failed";
        await failedPayment.save();

        // Update the associated Order
        const order = await Order.findById(failedPayment.order);
        if (order) {
          order.status = "payment_failed";
          await order.save();
        }
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
