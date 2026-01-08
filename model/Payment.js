import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // one payment per order
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "usd",
    },

    paymentMethod: {
      type: String,
      enum: ["card"], // Stripe-only for now
      default: "card",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },

    refund: {
      refunded: { type: Boolean, default: false },
      refundId: { type: String },
      amount: { type: Number },
      refundedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
