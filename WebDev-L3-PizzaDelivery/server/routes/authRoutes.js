const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', verifyToken, getMe);

module.exports = router;
