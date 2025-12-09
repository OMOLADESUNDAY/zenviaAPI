import jwt from 'jsonwebtoken';
import { getRedisClient } from '../config/redis.js';
import { sendEmail } from '../utils/sendMail.js';
import User from '../model/User.js';


const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// REGISTER

export const register = async (req, res) => {
  try {
    const redis = await getRedisClient();
    const { email, password, name } = req.body;

    // Create user
    const user = await User.create({ email, password, name, role: 'user', isVerified: false });

    // Generate code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Save to Redis
    await redis.set(`verify:${user._id}`, verificationCode.toString(), { EX: 10 * 60 });

    // Send immediate response
    res.status(201).json({ 
      message: 'Verification code sent', 
      userId: user._id 
    });

    // Send email in background
    setTimeout(async () => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify Your Account',
          html: `
            <h2>Your verification code:</h2>
            <h1 style="background: #f0f0f0; padding: 20px; text-align: center;">
              ${verificationCode}
            </h1>
            <p>Enter this code to verify your account.</p>
          `
        });
      } catch (e) {
        console.log('Email background error:', e.message);
      }
    }, 0);

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
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