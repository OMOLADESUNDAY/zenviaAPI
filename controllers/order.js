import Order from '../model/Order.js';
import { ApiError } from '../utils/errorHandler.js';


export const makeOrder = async (req, res) => {
  const { products, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  if (!products || products.length === 0) {
    throw new ApiError('No products in the order.', 400);
  }

  if (!shippingAddress || !paymentMethod) {
    throw new ApiError('Shipping address and payment method are required.', 400);
  }

  const order = await Order.create({
    user: req.user._id,
    products,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,  
    totalPrice,
  });

  res.status(201).json({ success: true, data: order });
};

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    throw new ApiError('No orders found for this user.', 404);
  }

  res.status(200).json({ success: true, data: orders });
};

export const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    throw new ApiError('Order not found or access denied.', 404);
  }

  res.status(200).json({ success: true, data: order });
};

export const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    throw new ApiError('Order not found or access denied.', 404);
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    throw new ApiError('Cannot cancel shipped or delivered orders.', 400);
  }

  order.status = 'cancelled';
  await order.save();
  res.status(200).json({ success: true, data: order });
};
