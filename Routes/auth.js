
import express from "express";
import { login, register, logout, getMe, updateUser, verifyAccount } from "../controllers/auth.js";
import { cacheMiddleware } from "../utils/cache.js";
import { protect } from "../auth/auth.js";
import { generateResetToken,verifyResetToken } from "../utils/resetTokenCache.js";
import { forgotPassword,resetPassword } from "../controllers/auth.js";
const router = express.Router();

// PUBLIC ROUTES
router.post("/login", login);           // no caching
router.post("/register", register);     // no caching
router.post("/forget-password",generateResetToken, forgotPassword); // placeholder
router.post("/reset-password",verifyResetToken,resetPassword);  // placeholder
router.post('/verify-account', verifyAccount);
// PROTECTED ROUTES
router.get(
  "/me",
  protect,                                  // validate token
  cacheMiddleware((req) => `user:${req.user.id}`, 60), // cache for 60s
  getMe
);

router.put(
  "/users/:id",
  protect,
  updateUser                                      // invalidate cache inside controller
);

router.post("/logout", protect, logout);

export default router;
