import express from 'express';
import { protect } from '../auth/auth.js';
import { makeOrder, getUserOrders, getSingleOrder, cancelOrder } from '../controllers/order.js';

const router = express.Router();

// Place a new order
router.post('/place-orders', protect, makeOrder);

// Get all orders of logged-in user
router.get('/my-orders/', protect, getUserOrders);

// Get a single order
router.get('/orders/:id', protect, getSingleOrder);

// Cancel an order
router.patch('/orders/:id/cancel', protect, cancelOrder);

export default router;
