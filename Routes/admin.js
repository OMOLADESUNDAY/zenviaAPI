import express from "express";
import upload from "../middleware/upload.js";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,

  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,

  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  banUser,

  getAllOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,

  getAllPayments,
  getPayment,
  refundPayment,

  createShippingMethod,
  getAllShippingMethods,
  updateShippingMethod,
  deleteShippingMethod,

  getSalesReport,
  getRevenueReport,
  getUserReport,

  createAdmin,
  deleteAdmin,
  getAllAdmins,
} from "../controllers/admin.js";

import { adminProtect } from "../auth/auth.js";
import { getAllCart } from "../controllers/cart.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin Auth
 *   - name: Admin Products
 *   - name: Admin Categories
 *   - name: Admin Users
 *   - name: Admin Orders
 *   - name: Admin Payments
 *   - name: Admin Shipping
 *   - name: Admin Reports
 *   - name: Admin Cart
 */

/* ================= ADMIN AUTH ================= */

/**
 * @swagger
 * /api/admin/admin-account/create:
 *   post:
 *     summary: Create admin account
 *     tags: [Admin Auth]
 */
router.post("/admin-account/create", createAdmin);

/**
 * @swagger
 * /api/admin/admin-account/delete:
 *   delete:
 *     summary: Delete admin account
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/admin-account/delete", adminProtect, deleteAdmin);

/**
 * @swagger
 * /api/admin/admin-all:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin-all", adminProtect, getAllAdmins);

/* ================= PRODUCTS ================= */

/**
 * @swagger
 * /api/admin/product:
 *   post:
 *     summary: Create product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.post("/product", adminProtect, upload.array("images", 5), createProduct);

/**
 * @swagger
 * /api/admin/product:
 *   get:
 *     summary: Get all products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.get("/product", adminProtect, getAllProducts);

/**
 * @swagger
 * /api/admin/product/{id}:
 *   get:
 *     summary: Get single product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.get("/product/:id", adminProtect, getProduct);

/**
 * @swagger
 * /api/admin/product/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.put("/product/:id", adminProtect, upload.array("images", 5), updateProduct);

/**
 * @swagger
 * /api/admin/product/{id}/stock:
 *   patch:
 *     summary: Update product stock
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/product/:id/stock", adminProtect, updateProductStock);

/**
 * @swagger
 * /api/admin/product/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/product/:id", adminProtect, deleteProduct);

/* ================= CATEGORIES ================= */

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 */
router.post("/categories", adminProtect, createCategory);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 */
router.get("/categories", adminProtect, getAllCategories);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 */
router.put("/categories/:id", adminProtect, updateCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/categories/:id", adminProtect, deleteCategory);

/* ================= USERS ================= */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 */
router.get("/users", adminProtect, getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 */
router.get("/users/:id", adminProtect, getUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 */
router.put("/users/:id", adminProtect, updateUser);

/**
 * @swagger
 * /api/admin/users/{id}/ban:
 *   patch:
 *     summary: Ban user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/users/:id/ban", adminProtect, banUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/users/:id", adminProtect, deleteUser);

/* ================= ORDERS ================= */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get("/orders", adminProtect, getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get("/orders/:id", adminProtect, getOrder);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/orders/:id/status", adminProtect, updateOrderStatus);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/orders/:id", adminProtect, deleteOrder);

/* ================= PAYMENTS ================= */

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/payments", adminProtect, getAllPayments);

/**
 * @swagger
 * /api/admin/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/payments/:id", adminProtect, getPayment);

/**
 * @swagger
 * /api/admin/payments/{id}/refund:
 *   patch:
 *     summary: Refund payment
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/payments/:id/refund", adminProtect, refundPayment);

/* ================= SHIPPING ================= */

/**
 * @swagger
 * /api/admin/shipping-method:
 *   post:
 *     summary: Create shipping method
 *     tags: [Admin Shipping]
 *     security:
 *       - bearerAuth: []
 */
router.post("/shipping-method", adminProtect, createShippingMethod);

/**
 * @swagger
 * /api/admin/shipping-method:
 *   get:
 *     summary: Get all shipping methods
 *     tags: [Admin Shipping]
 *     security:
 *       - bearerAuth: []
 */
router.get("/shipping-method", adminProtect, getAllShippingMethods);

/**
 * @swagger
 * /api/admin/shipping-method/{id}:
 *   put:
 *     summary: Update shipping method
 *     tags: [Admin Shipping]
 *     security:
 *       - bearerAuth: []
 */
router.put("/shipping-method/:id", adminProtect, updateShippingMethod);

/**
 * @swagger
 * /api/admin/shipping-method/{id}:
 *   delete:
 *     summary: Delete shipping method
 *     tags: [Admin Shipping]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/shipping-method/:id", adminProtect, deleteShippingMethod);

/* ================= REPORTS ================= */

/**
 * @swagger
 * /api/admin/reports/sales:
 *   get:
 *     summary: Get sales report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get("/reports/sales", adminProtect, getSalesReport);

/**
 * @swagger
 * /api/admin/reports/revenue:
 *   get:
 *     summary: Get revenue report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get("/reports/revenue", adminProtect, getRevenueReport);

/**
 * @swagger
 * /api/admin/reports/users:
 *   get:
 *     summary: Get user report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get("/reports/users", adminProtect, getUserReport);

/* ================= CART ================= */

/**
 * @swagger
 * /api/admin/get-all-cart:
 *   get:
 *     summary: Get all carts
 *     tags: [Admin Cart]
 *     security:
 *       - bearerAuth: []
 */
router.get("/get-all-cart", adminProtect, getAllCart);

export default router;
