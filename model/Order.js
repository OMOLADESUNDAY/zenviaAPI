import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true, // snapshot price
        },
      },
    ],

    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      street: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      zip: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
      note: { type: String },
    },

    paymentMethod: {
      type: String,
      enum: ["card"],
      default: "card",
    },

    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    // 🔐 PAYMENT STATE
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    stripePaymentIntentId: { type: String },

    // 🚚 FULFILLMENT
    status: {
      type: String,
      enum: [
        "pending",          // order created
        "payment_pending",  // payment intent created
        "paid",             // webhook confirmed
        "processing",
        "shipped",
        "delivered",
        "payment_failed",
        "cancelled",
      ],
      default: "pending",
    },

    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
