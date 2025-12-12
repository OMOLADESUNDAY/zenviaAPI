import express from "express";
import {
  getCart,
  addToCart,
  updateCartProduct,
  removeFromCart,
  clearCart
} from "../controllers/cart.js";
import { protect } from "../auth/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User cart management
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get("/", protect, getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add products to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Cart updated successfully
 */
router.post("/", protect, addToCart);

/**
 * @swagger
 * /api/cart:
 *   put:
 *     summary: Update quantity of a product in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart product updated
 */
router.put("/", protect, updateCartProduct);

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Remove a product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from cart
 */
router.delete("/:productId", protect, removeFromCart);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete("/", protect, clearCart);

export default router;
