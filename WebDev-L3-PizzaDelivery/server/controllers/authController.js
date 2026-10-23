const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../config/mailer");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET ||
      "super_secret_jwt_key_slicecraft_2026_change_in_production",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

/**
 * @desc    Register a new user and send verification email
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "user",
      isVerified: false,
      verificationToken,
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message:
        "Registration successful! A verification email has been sent to your address. Please verify your email to log in.",

      devVerificationToken:
        process.env.NODE_ENV !== "production" ? verificationToken : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

/**
 * @desc    Verify email using token sent via email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired email verification token.",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Your email has been verified successfully! You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error verifying email.",
      error: error.message,
    });
  }
};

/**
 * @desc    User Login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. User does not exist.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isVerified: false,
        message:
          "Please verify your email before logging in. Check your inbox for the verification link.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};

/**
 * @desc    Dedicated Admin Login (Blocks non-admin accounts)
 * @route   POST /api/auth/admin/login
 * @access  Public (Restricted by Role)
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have administrative privileges.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Admin authentication successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during admin login.",
      error: error.message,
    });
  }
};

/**
 * @desc    Request Password Reset Email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your account email.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with that email, a password reset link has been dispatched.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset link dispatched. Please check your inbox.",
      devResetToken:
        process.env.NODE_ENV !== "production" ? resetToken : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error initiating password reset.",
      error: error.message,
    });
  }
};

/**
 * @desc    Reset Password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error resetting password.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get Current Logged In User
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile.",
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  getMe,
};
