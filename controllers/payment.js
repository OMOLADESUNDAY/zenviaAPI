import Payment from "../model/Payment.js";
import { ApiError } from "../utils/errorHandler.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= CREATE PAYMENT (USER) =================
export const createPayment = async (req, res) => {
   console.log("user id"+req)
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    throw new ApiError("All fields are required", 400);
  }

  // TODO: Validate order amount from DB to prevent tampering
 
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // amount in cents
    currency: "usd",
    payment_method_types: ["card"], // only allow card for security
    metadata: { orderId, userId: req.user._id.toString() },
  });

  const payment = await Payment.create({
    user: req.user._id,
    order: orderId,
    amount,
    paymentMethod: "card",
    transactionId: paymentIntent.id,
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
      const payment = await Payment.findOne({ transactionId: data.id });
      if (payment) {
        payment.status = "completed";
        await payment.save();
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = await Payment.findOne({ transactionId: data.id });
      if (failedPayment) {
        failedPayment.status = "failed";
        await failedPayment.save();
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

