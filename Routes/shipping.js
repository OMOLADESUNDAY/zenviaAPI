import express from 'express';
import { protect, adminProtect } from '../auth/auth.js';
import { createShipping, getShippingInfo, updateShippingStatus } from '../controllers/shipping.js';

const router = express.Router();

// User routes
router.post('/shipping', protect, createShipping);
router.get('/shipping/:orderId', protect, getShippingInfo);

// Admin routes
router.put('/shipping/:orderId/status', adminProtect, updateShippingStatus);

export default router;
