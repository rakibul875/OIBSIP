const crypto = require("crypto");
const Order = require("../models/Order");
const InventoryItem = require("../models/InventoryItem");
const Pizza = require("../models/Pizza");
const getRazorpayInstance = require("../config/razorpay");
const { sendOrderConfirmationEmail } = require("../config/mailer");

/**
 * @desc    Step 1: Check inventory availability & initialize Razorpay Order
 * @route   POST /api/orders/create-razorpay-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please select pizzas to proceed.",
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete delivery address and phone number.",
      });
    }

    let calculatedTotal = 0;
    const inventoryDeductionPlan = {};

    for (const item of items) {
      const qty = item.quantity || 1;

      if (item.pizzaType === "custom") {
        const { base, sauce, cheese, vegetables } = item.customDetails || {};

        if (!base?.id || !sauce?.id || !cheese?.id) {
          return res.status(400).json({
            success: false,
            message:
              "Custom pizza requires a valid base, sauce, and cheese selection.",
          });
        }

        const requiredIds = [base.id, sauce.id, cheese.id];
        if (vegetables && Array.isArray(vegetables)) {
          vegetables.forEach((v) => {
            if (v.id) requiredIds.push(v.id);
          });
        }

        const dbItems = await InventoryItem.find({ _id: { $in: requiredIds } });
        const dbItemMap = new Map(dbItems.map((i) => [i._id.toString(), i]));

        for (const id of requiredIds) {
          const invItem = dbItemMap.get(id.toString());
          if (!invItem) {
            return res.status(400).json({
              success: false,
              message: `An ingredient selected for custom pizza could not be found.`,
            });
          }

          if (invItem.stock < qty) {
            return res.status(400).json({
              success: false,
              message: `Sorry! '${invItem.name}' is currently out of stock (${invItem.stock} remaining). Please adjust your custom pizza.`,
            });
          }

          inventoryDeductionPlan[id] = (inventoryDeductionPlan[id] || 0) + qty;
        }

        calculatedTotal += Number(item.price) * qty;
      } else {
        const dbPizza = await Pizza.findById(item.presetPizzaId);
        if (!dbPizza) {
          return res.status(400).json({
            success: false,
            message: `Preset pizza '${item.name}' is unavailable.`,
          });
        }
        calculatedTotal += dbPizza.price * qty;
      }
    }

    const deliveryFee = calculatedTotal > 500 ? 0 : 40;
    const finalAmount = Math.round(calculatedTotal + deliveryFee);

    const razorpay = getRazorpayInstance();
    const options = {
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-4)}`,
      notes: {
        userId: req.user._id.toString(),
        customerEmail: req.user.email,
      },
    };

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpErr) {
      console.warn(
        "[Razorpay API Warning] Using Test Mode Mock Order ID due to keys/network:",
        rzpErr.message,
      );

      razorpayOrder = {
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
      };
    }

    res.status(200).json({
      success: true,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
      amount: finalAmount,
      deliveryFee,
      calculatedTotal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to initiate order checkout.",
      error: error.message,
    });
  }
};

/**
 * @desc    Step 2: Verify Razorpay Payment Signature, Deduct Stock, and Save Order
 * @route   POST /api/orders/verify-payment
 * @access  Private
 */
const verifyPaymentAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      deliveryAddress,
      totalAmount,
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret_key";

    const isMock =
      razorpay_order_id.startsWith("order_mock_") ||
      secret === "placeholder_secret_key";

    if (!isMock) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed. Invalid digital signature.",
        });
      }
    }

    const updatedIngredients = [];
    for (const item of items) {
      const qty = item.quantity || 1;
      if (item.pizzaType === "custom" && item.customDetails) {
        const { base, sauce, cheese, vegetables } = item.customDetails;
        const idsToDeduct = [base?.id, sauce?.id, cheese?.id];
        if (Array.isArray(vegetables)) {
          vegetables.forEach((v) => {
            if (v?.id) idsToDeduct.push(v.id);
          });
        }

        for (const ingredientId of idsToDeduct) {
          if (ingredientId) {
            const updated = await InventoryItem.findByIdAndUpdate(
              ingredientId,
              { $inc: { stock: -qty } },
              { new: true },
            );
            if (updated) {
              updatedIngredients.push(updated);
            }
          }
        }
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryAddress,
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id || `pay_${Date.now()}`,
      razorpaySignature: razorpay_signature || "mock_signature",
      orderStatus: "Order Received",
      statusHistory: [
        {
          status: "Order Received",
          timestamp: new Date(),
          note: "Payment successful. Order received by kitchen.",
        },
      ],
    });

    await order.populate("user", "name email");

    const io = req.app.get("io");
    if (io) {
      io.emit("newIncomingOrder", order);

      if (updatedIngredients.length > 0) {
        io.emit("inventoryBatchUpdated", updatedIngredients);
      }
    }

    sendOrderConfirmationEmail(req.user.email, order).catch((err) =>
      console.error("[Email Notification Error]:", err.message),
    );

    res.status(201).json({
      success: true,
      message: "Payment verified and order placed successfully!",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify payment and process order.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders for current logged in user
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your order history.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You cannot view this order.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order details.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders across all users (Admin only)
 * @route   GET /api/orders/admin/all
 * @access  Private / Admin
 */
const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "All") {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin order list.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update order status in real-time (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private / Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      "Order Received",
      "In Kitchen",
      "Sent to Delivery",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status}`,
    });

    await order.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`order_${order._id}`).emit("orderStatusUpdated", {
        orderId: order._id,
        newStatus: status,
        updatedOrder: order,
      });

      io.emit("orderStatusUpdated", {
        orderId: order._id,
        newStatus: status,
        updatedOrder: order,
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentAndPlaceOrder,
  getUserOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
};
