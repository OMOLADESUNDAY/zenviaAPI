import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    avatar: {
      public_id: String,
      url: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔍 Check password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🎟️ Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;






// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import crypto from 'crypto';

// const userSchema = new mongoose.Schema({
//   // Identity
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true,
//     maxlength: [50, 'Name cannot exceed 50 characters'],
//     minlength: [2, 'Name must be at least 2 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     validate: {
//       validator: function(email) {
//         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//       },
//       message: 'Please provide a valid email'
//     }
//   },
  
//   // Authentication
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: [8, 'Password must be at least 8 characters'],
//     select: false // Never return password in queries
//   },
//   passwordChangedAt: Date,
//   passwordResetToken: String,
//   passwordResetExpires: Date,
  
//   // Verification
//   emailVerified: {
//     type: Boolean,
//     default: false
//   },
//   emailVerificationToken: String,
//   emailVerificationExpires: Date,
  
//   // Security
//   twoFactorEnabled: {
//     type: Boolean,
//     default: false
//   },
//   twoFactorSecret: String,
//   loginAttempts: {
//     type: Number,
//     default: 0
//   },
//   lockUntil: Date,
  
//   // Profile
//   avatar: String,
//   role: {
//     type: String,
//     enum: ['user', 'admin', 'moderator'],
//     default: 'user'
//   },
//   dateOfBirth: Date,
//   phone: String,
  
//   // Preferences
//   preferences: {
//     newsletter: { type: Boolean, default: true },
//     notifications: { type: Boolean, default: true },
//     theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' }
//   },
  
//   // Timestamps
//   lastLogin: Date,
//   lastActive: Date
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // =====================
// // INDEXES (Performance)
// // =====================
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });
// userSchema.index({ createdAt: 1 });
// userSchema.index({ lastActive: -1 });

// // =====================
// // VIRTUAL FIELDS
// // =====================
// userSchema.virtual('isLocked').get(function() {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// });

// userSchema.virtual('age').get(function() {
//   if (!this.dateOfBirth) return null;
//   return Math.floor((Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
// });

// // =====================
// // MIDDLEWARE
// // =====================

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   // Only run if password was modified
//   if (!this.isModified('password')) return next();
  
//   // Hash password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);
  
//   // Delete passwordConfirm field
//   this.passwordConfirm = undefined;
//   next();
// });

// // Update passwordChangedAt when password is modified
// userSchema.pre('save', function(next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   this.passwordChangedAt = Date.now() - 1000; // Ensure token is created after
//   next();
// });

// // Update lastActive on save
// userSchema.pre('save', function(next) {
//   if (this.isModified('lastActive')) {
//     this.lastActive = new Date();
//   }
//   next();
// });

// // =====================
// // INSTANCE METHODS
// // =====================

// // Compare password
// userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// // Check if password was changed after JWT was issued
// userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

// // Generate password reset token
// userSchema.methods.createPasswordResetToken = function() {
//   const resetToken = crypto.randomBytes(32).toString('hex');
  
//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');
    
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
//   return resetToken;
// };

// // Generate email verification token
// userSchema.methods.createEmailVerificationToken = function() {
//   const verificationToken = crypto.randomBytes(32).toString('hex');
  
//   this.emailVerificationToken = crypto
//     .createHash('sha256')
//     .update(verificationToken)
//     .digest('hex');
    
//   this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
//   return verificationToken;
// };

// // Check login attempts (brute force protection)
// userSchema.methods.incrementLoginAttempts = async function() {
//   // If we have a previous lock that has expired, restart at 1
//   if (this.lockUntil && this.lockUntil < Date.now()) {
//     return this.updateOne({
//       $set: { loginAttempts: 1 },
//       $unset: { lockUntil: 1 }
//     });
//   }
  
//   // Otherwise we're incrementing
//   const updates = { $inc: { loginAttempts: 1 } };
  
//   // Lock the account if we've reached max attempts and it's not locked already
//   if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
//     updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
//   }
  
//   return this.updateOne(updates);
// };

// // Reset login attempts on successful login
// userSchema.methods.resetLoginAttempts = function() {
//   return this.updateOne({
//     $set: { loginAttempts: 0 },
//     $unset: { lockUntil: 1 }
//   });
// };

// // =====================
// // STATIC METHODS
// // =====================

// // Find user by email (for authentication)
// userSchema.statics.findByEmail = function(email) {
//   return this.findOne({ email: email.toLowerCase() });
// };

// // Get users by role
// userSchema.statics.getByRole = function(role) {
//   return this.find({ role }).select('-password');
// };

// // Search users
// userSchema.statics.search = function(query) {
//   const searchRegex = new RegExp(query, 'i');
//   return this.find({
//     $or: [
//       { name: searchRegex },
//       { email: searchRegex }
//     ]
//   }).select('name email avatar role createdAt');
// };

// export default mongoose.model('User', userSchema);
