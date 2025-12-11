import express from "express";
import {
  getCart,
  getAllCart,
  addToCart,
  updateCartProduct,
  removeFromCart,
  clearCart
} from "../controllers/cart.js";
import { protect } from "../auth/auth.js"; // middleware to protect routes

const router = express.Router();

// ---------------- USER CART ----------------

// Get the current user's cart
router.get("/", protect, getCart);

// Add product to cart
router.post("/", protect, addToCart);

// Update quantity of a product in cart
router.put("/", protect, updateCartProduct);

// Remove a product from cart
router.delete("/:productId", protect, removeFromCart);

// Clear all products from cart
router.delete("/", protect, clearCart);

// ---------------- ADMIN CART ----------------
// Get all carts (admin only)
router.get("/all", protect, getAllCart); // you can protect this with adminProtect if needed

export default router;
