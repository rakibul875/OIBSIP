const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentAndPlaceOrder,
  getUserOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
} = require("../controllers/orderController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

router.post("/create-razorpay-order", verifyToken, createRazorpayOrder);
router.post("/verify-payment", verifyToken, verifyPaymentAndPlaceOrder);
router.get("/my-orders", verifyToken, getUserOrders);
router.get("/detail/:id", verifyToken, getOrderById);

router.get("/admin/all", verifyToken, requireAdmin, getAllOrdersAdmin);
router.put("/:id/status", verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;
