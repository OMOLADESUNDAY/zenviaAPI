// import jwt from 'jsonwebtoken';
// import { getRedisClient } from '../config/redis.js';
// import { sendEmail } from '../utils/sendMail.js';
// import User from '../model/User.js';


// const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// // REGISTER
// export const register = async (req, res) => {
//   const redis = getRedisClient();  // FIX

//   const { email, password, name } = req.body;

//   const user = await User.create({ email, password, name, role: 'user', isVerified: false });

//   const verificationCode = Math.floor(100000 + Math.random() * 900000);

//   await redis.set(`verify:${user._id}`, verificationCode.toString(), { EX: 10 * 60 });

//   await sendEmail({
//     to: user.email,
//     subject: 'Verify Your Account',
//     html: `
//       <p>Hi ${user.name},</p>
//       <p>Your verification code:</p>
//       <h2>${verificationCode}</h2>
//       <p>Expires in 10 minutes.</p>
//     `,
//   });

//   res.status(201).json({ message: 'Verification code sent', userId: user._id });
// };


//   // Verify account using code from email
// export const verifyAccount = async (req, res) => {
//   const redis = getRedisClient();  // FIX

//   const { userId, code } = req.body;

//   const storedCode = await redis.get(`verify:${userId}`);
//   if (!storedCode) return res.status(400).json({ message: 'Code expired' });

//   if (storedCode !== code.toString()) {
//     return res.status(400).json({ message: 'Invalid code' });
//   }

//   await User.findByIdAndUpdate(userId, { isVerified: true });
//   await redis.del(`verify:${userId}`);

//   res.json({ message: 'Verified successfully!' });
// };




// // LOGIN
// export const login = async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//   // TODO: validate password securely
//   const token = signToken(user._id);
//   res.json({ token });
// };

// // LOGOUT
// export const logout = async (req, res) => {
//   const redis = getRedisClient();  // FIX

//   const token = req.headers.authorization?.split(' ')[1];
//   if (token) await redis.set(`blacklist:${token}`, true, { EX: 3600 });

//   res.json({ message: 'Logged out' });
// };

// // GET /me
// export const getMe = async (req, res) => {
//   const user = await User.findById(req.user._id).select('-password');
//   res.json(user);
// };


// // UPDATE USER
// export const updateUser = async (req, res) => {
//   const redis = getRedisClient();  // FIX

//   const userId = req.params.id;

//   const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

//   await redis.del(`user:${userId}`);

//   res.json({ message: 'Profile updated', user: updatedUser });
// };


// // Send password reset email
// export const forgotPassword = async (req, res) => {
//   const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${req.resetToken}`;

//   try {
//     await sendEmail({
//       to: req.user.email,
//       subject: 'Password Reset',
//       text: `Click this link to reset your password: ${resetUrl} (expires in 10 minutes)`,
//     });

//     res.json({ message: 'Password reset email sent.' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to send password reset email.' });
//   }
// };

// // Reset password
// export const resetPassword = async (req, res) => {
//   const redis = getRedisClient();  // FIX

//   const { password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 12);

//   await User.findByIdAndUpdate(req.userId, { password: hashedPassword });

//   await redis.del(req.tokenHash);

//   res.json({ message: 'Password reset successful' });
// };


import jwt from 'jsonwebtoken';
import { getRedisClient } from '../config/redis.js';
import { sendEmail } from '../utils/sendMail.js';
import User from '../model/User.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// REGISTER - FIXED with await
export const register = async (req, res) => {
  try {
    const redis = await getRedisClient();  // ADDED await

    const { email, password, name } = req.body;

    const user = await User.create({ email, password, name, role: 'user', isVerified: false });

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    await redis.set(`verify:${user._id}`, verificationCode.toString(), { EX: 10 * 60 });

    // Send response immediately
    res.status(201).json({ 
      message: 'Verification code sent', 
      userId: user._id,
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
    });

    // Send email in background
    setTimeout(async () => {
      try {
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
      } catch (emailError) {
        console.log('Email failed:', emailError.message);
      }
    }, 0);

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Verify account using code from email - FIXED
export const verifyAccount = async (req, res) => {
  try {
    const redis = await getRedisClient();  // ADDED await

    const { userId, code } = req.body;

    const storedCode = await redis.get(`verify:${userId}`);
    if (!storedCode) return res.status(400).json({ message: 'Code expired' });

    if (storedCode !== code.toString()) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    await User.findByIdAndUpdate(userId, { isVerified: true });
    await redis.del(`verify:${userId}`);

    res.json({ message: 'Verified successfully!' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // TODO: validate password securely
    const token = signToken(user._id);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// LOGOUT - FIXED
export const logout = async (req, res) => {
  try {
    const redis = await getRedisClient();  // ADDED await

    const token = req.headers.authorization?.split(' ')[1];
    if (token) await redis.set(`blacklist:${token}`, true, { EX: 3600 });

    res.json({ message: 'Logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// GET /me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// UPDATE USER - FIXED
export const updateUser = async (req, res) => {
  try {
    const redis = await getRedisClient();  // ADDED await

    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

    await redis.del(`user:${userId}`);

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Update failed' });
  }
};

// Send password reset email - FIXED
export const forgotPassword = async (req, res) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${req.resetToken}`;

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

// Reset password - FIXED
export const resetPassword = async (req, res) => {
  try {
    const redis = await getRedisClient();  // ADDED await

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    await User.findByIdAndUpdate(req.userId, { password: hashedPassword });

    await redis.del(req.tokenHash);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};