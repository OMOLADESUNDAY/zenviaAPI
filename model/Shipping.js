import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // One shipping entry per order
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingAddress: {
      lastName: { type: String, required: true },
      firstName: { type: String, required: true },
      street: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      zip: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingMethod: {
      type: String,
      enum: ["standard", "express", "overnight"],
      default: "standard",
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "in-transit", "delivered", "cancelled"],
      default: "pending",
    },
    estimatedDelivery: {
      type: Date,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const Shipping = mongoose.model("Shipping", shippingSchema);

export default Shipping;

