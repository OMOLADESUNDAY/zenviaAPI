import jwt from 'jsonwebtoken';
import { getRedisClient } from '../config/redis.js';
import { sendEmail } from '../utils/sendMail.js';
import User from '../model/User.js';
import { ApiError } from '../utils/errorHandler.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// REGISTER
export const register = async (req, res, next) => {
  try {
    const redis = getRedisClient();
    const { email, password, name } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError('User with this email already exists', 409);
    }

    // 2. Create new user
    const user = await User.create({ 
      email, 
      password, 
      name, 
      role: 'user', 
      isVerified: false 
    });

    // 3. Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // 4. Store in Redis with 10-minute expiration
    await redis.set(`verify:${user._id}`, verificationCode.toString(), { 
      EX: 10 * 60 
    });

    // 5. Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Account',
      html: `
        <p>Hi ${user.name},</p>
        <p>Your verification code:</p>
        <h2>${verificationCode}</h2>
        <p>Expires in 10 minutes.</p>
      `,
    });

    // 6. Return success response
    res.status(201).json({ 
      message: 'Verification code sent', 
      userId: user._id 
    });

  } catch (error) {
    // Pass to your error handling middleware
    next(error);
  }
};

  // Verify account using code from email
export const verifyAccount = async (req, res) => {
  const redis = getRedisClient();  // FIX

  const { userId, code } = req.body;

  const storedCode = await redis.get(`verify:${userId}`);
  if (!storedCode) return res.status(400).json({ message: 'Code expired' });

  if (storedCode !== code.toString()) {
    return res.status(400).json({ message: 'Invalid code' });
  }

  await User.findByIdAndUpdate(userId, { isVerified: true });
  await redis.del(`verify:${userId}`);

  res.json({ message: 'Verified successfully!' });
};




// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // TODO: validate password securely
  const token = signToken(user._id);
  res.json({ token });
};

// LOGOUT
export const logout = async (req, res) => {
  const redis = getRedisClient();  // FIX

  const token = req.headers.authorization?.split(' ')[1];
  if (token) await redis.set(`blacklist:${token}`, true, { EX: 3600 });

  res.json({ message: 'Logged out' });
};

// GET /me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};


// UPDATE USER
export const updateUser = async (req, res) => {
  const redis = getRedisClient();  // FIX

  const userId = req.params.id;

  const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

  await redis.del(`user:${userId}`);

  res.json({ message: 'Profile updated', user: updatedUser });
};


// Send password reset email
export const forgotPassword = async (req, res) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${req.resetToken}`;

  try {
    await sendEmail({
      to: req.user.email,
      subject: 'Password Reset',
      text: `Click this link to reset your password: ${resetUrl} (expires in 10 minutes)`,
    });

    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send password reset email.' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const redis = getRedisClient();  // FIX

  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  await User.findByIdAndUpdate(req.userId, { password: hashedPassword });

  await redis.del(req.tokenHash);

  res.json({ message: 'Password reset successful' });
};