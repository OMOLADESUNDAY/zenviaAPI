// middleware/resetTokenCache.js
import { getRedisClient } from '../config/redis.js';
import crypto from 'crypto';

const RESET_TOKEN_EXPIRE = 10 * 60; // 10 minutes

// Generate reset token and store in Redis
export const generateResetToken = async (req, res, next) => {
     const redisClient = getRedisClient();

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const User = await import('../models/User.js').then(mod => mod.default);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await redisClient.set(`reset:${resetTokenHash}`, user._id.toString(), { EX: RESET_TOKEN_EXPIRE });

    req.user = user;
    req.resetToken = resetToken;
    req.resetTokenHash = resetTokenHash;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate reset token' });
  }
};

// Verify token from URL
export const verifyResetToken = async (req, res, next) => {
     const redisClient = getRedisClient();

  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await redisClient.get(`reset:${tokenHash}`);
    if (!userId) return res.status(400).json({ message: 'Invalid or expired reset token' });

    req.userId = userId;
    req.tokenHash = tokenHash;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to verify reset token' });
  }
};
