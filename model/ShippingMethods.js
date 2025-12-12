import mongoose from "mongoose";

const shippingMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shipping method name is required"],
      trim: true
    },

    price: {
      type: Number,
      required: [true, "Shipping price is required"],
      min: [0, "Shipping price cannot be negative"]
    },

    deliveryTime: {
      type: String,
      required: [true, "Delivery time is required"], // e.g. "1-3 days"
      trim: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ShippingMethod", shippingMethodSchema);
