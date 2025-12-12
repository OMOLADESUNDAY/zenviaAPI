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

    // Newly added
    passwordChangedAt: Date,
    isLocked: { type: Boolean, default: false },

    // OAuth login support
    oauthId: { type: String },
    provider: { type: String },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

/* -----------------------------------------------------------
   🔐 HASH PASSWORD BEFORE SAVE
----------------------------------------------------------- */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* -----------------------------------------------------------
   🔐 SET passwordChangedAt WHEN PASSWORD IS UPDATED
----------------------------------------------------------- */
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // Ensure this timestamp is always before JWT is issued
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/* -----------------------------------------------------------
   🔍 CHECK CORRECT PASSWORD
----------------------------------------------------------- */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* -----------------------------------------------------------
   🎟  GENERATE RESET PASSWORD TOKEN
----------------------------------------------------------- */
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

/* -----------------------------------------------------------
   🔐 CHECK IF PASSWORD CHANGED AFTER JWT WAS ISSUED
----------------------------------------------------------- */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;

  const changedTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );

  return changedTimestamp > JWTTimestamp;
};

const User = mongoose.model("User", userSchema);
export default User;
