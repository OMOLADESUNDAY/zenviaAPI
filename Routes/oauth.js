import express from "express";
import passport from "../controllers/oauth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: Social authentication (Google & GitHub)
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [OAuth]
 *     description: Redirects user to Google OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     description: Handles Google OAuth response and issues JWT
 *     responses:
 *       200:
 *         description: Authentication successful, JWT returned
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, user: req.user });
  }
);

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: Authenticate with GitHub
 *     tags: [OAuth]
 *     description: Redirects user to GitHub OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 */
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [OAuth]
 *     description: Handles GitHub OAuth response and issues JWT
 *     responses:
 *       200:
 *         description: Authentication successful, JWT returned
 */
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, user: req.user });
  }
);

export default router;
