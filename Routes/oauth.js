import express from "express";
import passport from "../controller/oauth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Issue JWT
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: req.user });
  }
);

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: req.user });
  }
);

export default router;
