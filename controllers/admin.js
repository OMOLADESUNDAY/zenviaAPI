// ================== ADMIN CONTROLLER ==================
import Product from "../model/Product.js";
import Category from "../model/Category.js";
import User from "../model/User.js";
import Order from "../model/Order.js";
import Payment from "../model/Payment.js";
import Shipping from "../model/Shipping.js";
import Coupon from "../model/Coupon.js";

import APIFeatures from "../utils/apiFeatures.js";
import { connectRedis } from "../config/redis.js";
import { ApiError } from "../utils/errorHandler.js";

// Helper to create JWT
const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ================== UTILITY ==================
const cacheKey = (type, query) => `${type}:${JSON.stringify(query)}`;

// ================== PRODUCTS ==================

export const getAllProducts = async (req, res) => {
  const redis = await connectRedis();
  const key = cacheKey("products", req.query);

  const cached = await redis.get(key);
  if (cached) return res.json({ success: true, source: "cache", data: JSON.parse(cached) });

  const features = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .paginate();

  const products = await features.query;
  await redis.setEx(key, 600, JSON.stringify(products));

  res.json({ success: true, source: "db", data: products });
};

export const getProduct = async (req, res) => {
  const redis = await connectRedis();
  const key = `product:${req.params.id}`;

  const cached = await redis.get(key);
  if (cached) return res.json({ success: true, source: "cache", data: JSON.parse(cached) });

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError("Product not found", 404);

  await redis.setEx(key, 600, JSON.stringify(product));
  res.json({ success: true, source: "db", data: product });
};

export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  const redis = await connectRedis();
  await redis.keys("products:*").then(keys => keys.forEach(k => redis.del(k)));

  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) throw new ApiError("Product not found", 404);

  const redis = await connectRedis();
  await redis.del(`product:${req.params.id}`);
  await redis.keys("products:*").then(keys => keys.forEach(k => redis.del(k)));

  res.json({ success: true, data: product });
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError("Product not found", 404);

  const redis = await connectRedis();
  await redis.del(`product:${req.params.id}`);
  await redis.keys("products:*").then(keys => keys.forEach(k => redis.del(k)));

  res.json({ success: true, message: "Product deleted successfully" });
};

// ================== CATEGORIES ==================

export const getAllCategories = async (req, res) => {
  const redis = await connectRedis();
  const key = "categories:all";

  const cached = await redis.get(key);
  if (cached) return res.json({ success: true, source: "cache", data: JSON.parse(cached) });

  const categories = await Category.find();
  await redis.setEx(key, 600, JSON.stringify(categories));

  res.json({ success: true, source: "db", data: categories });
};

export const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  const redis = await connectRedis();
  await redis.del("categories:all");

  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new ApiError("Category not found", 404);

  const redis = await connectRedis();
  await redis.del("categories:all");

  res.json({ success: true, data: category });
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError("Category not found", 404);

  const redis = await connectRedis();
  await redis.del("categories:all");

  res.json({ success: true, message: "Category deleted successfully" });
};

// ================== USERS ==================

export const getAllUsers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit);
  const total = await User.countDocuments();

  res.json({ success: true, data: users, pagination: { page, limit, totalPages: Math.ceil(total / limit), total } });
};

export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError("User not found", 404);
  res.json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) throw new ApiError("User not found", 404);
  res.json({ success: true, data: user });
};

export const banUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { banned: true }, { new: true });
  if (!user) throw new ApiError("User not found", 404);
  res.json({ success: true, message: "User banned successfully", data: user });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError("User not found", 404);
  res.json({ success: true, message: "User deleted successfully" });
};

// ================== ORDERS ==================

export const getAllOrders = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const orders = await Order.find().skip(skip).limit(limit).populate("user").populate("products.product");
  const total = await Order.countDocuments();

  res.json({ success: true, data: orders, pagination: { page, limit, totalPages: Math.ceil(total / limit), total } });
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user").populate("products.product");
  if (!order) throw new ApiError("Order not found", 404);
  res.json({ success: true, data: order });
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw new ApiError("Order not found", 404);
  res.json({ success: true, message: "Order status updated", data: order });
};

export const deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) throw new ApiError("Order not found", 404);
  res.json({ success: true, message: "Order deleted successfully" });
};

// ================== PAYMENTS ==================

export const getAllPayments = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const payments = await Payment.find().skip(skip).limit(limit).populate("order").populate("user");
  const total = await Payment.countDocuments();

  res.json({ success: true, data: payments, pagination: { page, limit, totalPages: Math.ceil(total / limit), total } });
};

export const getPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("order").populate("user");
  if (!payment) throw new ApiError("Payment not found", 404);
  res.json({ success: true, data: payment });
};

export const refundPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError("Payment not found", 404);
  payment.refunded = true;
  await payment.save();
  res.json({ success: true, message: "Payment refunded successfully", data: payment });
};

// ================== SHIPPING ==================

export const createShipping = async (req, res) => {
  const shipping = await Shipping.create(req.body);
  res.status(201).json({ success: true, data: shipping });
};

export const getAllShipping = async (req, res) => {
  const shippingOptions = await Shipping.find();
  res.json({ success: true, data: shippingOptions });
};

export const updateShipping = async (req, res) => {
  const shipping = await Shipping.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!shipping) throw new ApiError("Shipping not found", 404);
  res.json({ success: true, data: shipping });
};

export const deleteShipping = async (req, res) => {
  const shipping = await Shipping.findByIdAndDelete(req.params.id);
  if (!shipping) throw new ApiError("Shipping not found", 404);
  res.json({ success: true, message: "Shipping deleted successfully" });
};

// ================== COUPONS ==================

export const createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
};

export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find();
  res.json({ success: true, data: coupons });
};

export const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) throw new ApiError("Coupon not found", 404);
  res.json({ success: true, data: coupon });
};

export const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError("Coupon not found", 404);
  res.json({ success: true, message: "Coupon deleted successfully" });
};

// ================== REPORTS ==================

export const getSalesReport = async (req, res) => {
  const sales = await Order.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$createdAt", totalSales: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  res.json({ success: true, data: sales });
};

export const getRevenueReport = async (req, res) => {
  const revenue = await Payment.aggregate([
    { $match: { refunded: false } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);
  res.json({ success: true, data: revenue[0] || { totalRevenue: 0 } });
};

export const getUserReport = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const bannedUsers = await User.countDocuments({ banned: true });
  res.json({ success: true, data: { totalUsers, bannedUsers } });
};
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError("Email and password required", 400);

  const admin = await Admin.findOne({ email });
  if (!admin) throw new ApiError("Invalid credentials", 401);

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) throw new ApiError("Invalid credentials", 401);

  const token = generateToken(admin._id);

  res.json({
    success: true,
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email },
  });
};
// ================== LOGOUT ==================
export const adminLogout = async (req, res) => {
  // Frontend should just delete the JWT token
  res.json({ success: true, message: "Admin logged out successfully" });
};

// ================== PROFILE ==================
export const getAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select("-password");
  if (!admin) throw new ApiError("Admin not found", 404);

  res.json({ success: true, data: admin });
};
// ================== UPDATE PASSWORD ==================
export const updateAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError("Both passwords are required", 400);

  const admin = await Admin.findById(req.admin.id);
  if (!admin) throw new ApiError("Admin not found", 404);

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError("Current password is incorrect", 401);

  admin.password = newPassword;
  await admin.save();

  res.json({ success: true, message: "Password updated successfully" });
};
export const updateProductStock = async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true }
  );
  if (!product) throw new ApiError("Product not found", 404);
  res.json({ success: true, data: product });
};