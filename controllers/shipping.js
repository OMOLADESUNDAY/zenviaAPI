
import Shipping from '../model/Shipping.js';
import Order from '../model/Order.js';
import { ApiError } from '../utils/errorHandler.js';


export const createShipping = async (req, res) => {
  const { orderId, shippingAddress, shippingMethod, estimatedDelivery, shippingCost } = req.body;

  if (!orderId || !shippingAddress) {
    throw new ApiError('Order ID and shipping address are required.', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError('Order not found.', 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError('Access denied.', 403);
  }

  // Prevent duplicate shipping entries
  const existingShipping = await Shipping.findOne({ order: orderId });
  if (existingShipping) {
    throw new ApiError('Shipping info already exists for this order.', 400);
  }

  const shipping = await Shipping.create({
    order: orderId,
    user: req.user._id,
    shippingAddress,
    shippingMethod: shippingMethod || 'standard',
    shippingCost: shippingCost || 0,
    estimatedDelivery,
  });

  res.status(201).json({
    success: true,
    data: shipping,
  });
};


export const getShippingInfo = async (req, res) => {
  const shipping = await Shipping.findOne({ order: req.params.orderId }).populate('order');

  if (!shipping) {
    throw new ApiError('Shipping info not found.', 404);
  }

  if (shipping.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError('Access denied.', 403);
  }

  res.status(200).json({
    success: true,
    data: shipping,
  });
};


export const updateShippingStatus = async (req, res) => {
  const { status, trackingNumber, shippedAt, deliveredAt } = req.body;

  const allowedStatuses = ['pending', 'shipped', 'in-transit', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError('Invalid shipping status.', 400);
  }

  const shipping = await Shipping.findOne({ order: req.params.orderId });
  if (!shipping) {
    throw new ApiError('Shipping info not found.', 404);
  }

  shipping.status = status;
  if (trackingNumber) shipping.trackingNumber = trackingNumber;
  if (shippedAt) shipping.shippedAt = shippedAt;
  if (deliveredAt) shipping.deliveredAt = deliveredAt;

  await shipping.save();

  res.status(200).json({
    success: true,
    data: shipping,
  });
};
