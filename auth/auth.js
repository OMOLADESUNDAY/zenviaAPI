import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { getRedisClient } from '../config/redis.js';


// Protect routes - user must be logged in
export const protect = async (req, res, next) => {
  const redisClient = getRedisClient();
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(); // allow optional auth

    // Check blacklist
    const blacklisted = await redisClient?.get(`blacklist:${token}`);
    if (blacklisted) return res.status(401).json({ success: false, message: 'Token revoked.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check Redis cache for user
    let user;
    const cachedUser = await redisClient?.get(`user:${decoded.id}`);
    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      user = await User.findById(decoded.id).select('+password');
      if (user) await redisClient?.set(`user:${decoded.id}`, JSON.stringify(user), { EX: 3600 });
    }

    if (!user || user.changedPasswordAfter(decoded.iat) || user.isLocked) {
      return res.status(401).json({ success: false, message: 'Invalid token or session expired.' });
    }

    req.user = user;
    next();
  } catch {
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
