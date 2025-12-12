import express from "express";
import {
  // Product controllers
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,

  // Category controllers
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,

  // User controllers
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  banUser,

  // Order controllers
  getAllOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,

  // Payment controllers
  getAllPayments,
  getPayment,
  refundPayment,

  // Shipping controllers
  createShippingMethod,
  getAllShippingMethods,
  updateShippingMethod,
  deleteShippingMethod,

  // Reports controllers
  getSalesReport,
  getRevenueReport,
  getUserReport,

  // Admin auth controllers
  createAdmin,
  deleteAdmin,
  getAllAdmins,
} from "../controllers/admin.js";

import { adminProtect } from "../auth/auth.js";
import { getAllCart } from "../controllers/cart.js";
const router = express.Router();

// ------------------ AUTH ------------------
router.post("/admin-account/create",createAdmin);
router.delete("/admin-account/delete", adminProtect, deleteAdmin);
router.get("/admin-all",adminProtect,getAllAdmins)

// ------------------ PRODUCTS ------------------
router.post("/product", adminProtect, createProduct);
router.get("/product", adminProtect, getAllProducts);
router.get("/product/:id", adminProtect, getProduct);
router.put("/product/:id", adminProtect, updateProduct);
router.patch("/product/:id/stock", adminProtect, updateProductStock);
router.delete("/product/:id", adminProtect, deleteProduct);

// ------------------ CATEGORIES ------------------
router.post("/categories", adminProtect, createCategory);
router.get("/categories", adminProtect, getAllCategories);
router.put("/categories/:id", adminProtect, updateCategory);
router.delete("/categories/:id", adminProtect, deleteCategory);

// ------------------ USERS ------------------
router.get("/users", adminProtect, getAllUsers);
router.get("/users/:id", adminProtect, getUser);
router.put("/users/:id", adminProtect, updateUser);
router.patch("/users/:id/ban", adminProtect, banUser);
router.delete("/users/:id", adminProtect, deleteUser);

// ------------------ ORDERS ------------------
router.get("/orders", adminProtect, getAllOrders);
router.get("/orders/:id", adminProtect, getOrder);
router.patch("/orders/:id/status", adminProtect, updateOrderStatus);
router.delete("/orders/:id", adminProtect, deleteOrder);

// ------------------ PAYMENTS ------------------
router.get("/payments", adminProtect, getAllPayments);
router.get("/payments/:id", adminProtect, getPayment);
router.patch("/payments/:id/refund", adminProtect, refundPayment);

// ------------------ SHIPPING ------------------
router.post("/shipping-method", adminProtect, createShippingMethod);
router.get("/shipping-method", adminProtect, getAllShippingMethods);
router.put("/shipping-method/:id", adminProtect, updateShippingMethod);
router.delete("/shipping-method/:id", adminProtect, deleteShippingMethod);

// ------------------ COUPONS ------------------
// router.post("/coupons", adminProtect, createCoupon);
// router.get("/coupons", adminProtect, getAllCoupons);
// router.put("/coupons/:id", adminProtect, updateCoupon);
// router.delete("/coupons/:id", adminProtect, deleteCoupon);

// ------------------ REPORTS ------------------
router.get("/reports/sales", adminProtect, getSalesReport);
router.get("/reports/revenue", adminProtect, getRevenueReport);
router.get("/reports/users", adminProtect, getUserReport);



// Get all cart
router.get("/get-all-cart", adminProtect, getAllCart);

export default router;
