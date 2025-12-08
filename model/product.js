import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  brand: String,
  category: String,
  price: Number,
  rating: Number,
  inStock: Boolean
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
