// import jwt from "jsonwebtoken";
// import User from "../model/User.js";
// import { getRedisClient } from "../config/redis.js";

// /* ------------------------------------------------------------
//    HELPER: Verify JWT and return decoded payload
// ------------------------------------------------------------ */
// const verifyToken = (token) => {
//   try {
//     return jwt.verify(token, process.env.JWT_SECRET);
//   } catch (err) {
//     throw err;
//   }
// };

// /* ------------------------------------------------------------
//    PROTECT: Require user to be logged in
// ------------------------------------------------------------ */
// export const protect = async (req, res, next) => {
//   console.log("Protect middleware triggered");
//   const redisClient = getRedisClient();

//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader?.startsWith("Bearer")) {
//       return res.status(401).json({ success: false, message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     console.log("Token found:", token);

//     // 1️⃣ Check if token is blacklisted (revoked)
//     const blacklisted = await redisClient.get(`blacklist:${token}`);
//     if (blacklisted) {
//       return res.status(401).json({ success: false, message: "Token revoked" });
//     }

//     // 2️⃣ Verify JWT
//     let decoded;
//     try {
//       decoded = verifyToken(token);
//     } catch (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({ success: false, message: "Token expired" });
//       }
//       return res.status(401).json({ success: false, message: "Invalid token" });
//     }

//     // 3️⃣ Check Redis cache for user
//     let user;
//     const cachedUser = await redisClient.get(`user:${decoded.id}`);
//     if (cachedUser) {
//       user = JSON.parse(cachedUser);
//       console.log("User loaded from Redis:", user.email);
//     } else {
//       user = await User.findById(decoded.id);
//       if (!user) return res.status(401).json({ success: false, message: "User not found" });
//       await redisClient.set(`user:${decoded.id}`, JSON.stringify(user), { EX: 3600 });
//       console.log("User fetched from DB and cached:", user.email);
//     }

//     // 4️⃣ Check for password changes or locked status
//     if (user.changedPasswordAfter(decoded.iat)) {
//       return res.status(401).json({ success: false, message: "Password changed recently. Please login again." });
//     }
//     if (user.isLocked) {
//       return res.status(403).json({ success: false, message: "User account is locked" });
//     }

//     // ✅ Attach user to request
//     req.user = user;
//     next();

//   } catch (err) {
//     console.error("Protect error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// /* ------------------------------------------------------------
//    ADMIN PROTECT: Only allow admins
// ------------------------------------------------------------ */
// export const adminProtect = [
//   protect,
//   (req, res, next) => {
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Admins only" });
//     }
//     console.log("Admin verified:", req.user.email);
//     next();
//   }
// ];

// /* ------------------------------------------------------------
//    UTILITY: Generate JWT for user
// ------------------------------------------------------------ */
// export const generateToken = (userId, expiresIn = "1h") => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
// };



import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { getRedisClient } from '../config/redis.js';

export const protect = async (req, res, next) => {
  const redisClient = getRedisClient();

  try {
    let token;

    // 1️⃣ Extract token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log("Token found:", token);
    }

    if (!token) return next(); // optional auth

    // 2️⃣ Check blacklist
    const blacklisted = await redisClient?.get(`blacklist:${token}`);
    if (blacklisted) return res.status(401).json({ success: false, message: 'Token revoked.' });

    // 3️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Load user from Redis cache
    let user;
    const cachedUser = await redisClient?.get(`user:${decoded.id}`);
    if (cachedUser) {
      // Rehydrate as Mongoose document so methods work
      user = new User(JSON.parse(cachedUser));
      console.log("User loaded from Redis:", user.email);
    } else {
      user = await User.findById(decoded.id).select('+password');
      if (user) {
        await redisClient?.set(`user:${decoded.id}`, JSON.stringify(user), { EX: 3600 });
      }
    }

    // 5️⃣ Validate user
    if (!user || user.changedPasswordAfter(decoded.iat) || user.isLocked) {
      return res.status(401).json({ success: false, message: 'Invalid token or session expired.' });
    }

    // 6️⃣ Attach user to request
    req.user = user;
    next();

  } catch (err) {
    console.error("Protect error:", err);
    return res.status(401).json({ success: false, message: 'Invalid token or session expired.' });
  }
};

// Admin protect
export const adminProtect = [
  protect,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admins only.' });
    }
    next();
  }
];
