const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  pizzaType: {
    type: String,
    enum: ["preset", "custom"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },

  customDetails: {
    base: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
      name: String,
    },
    sauce: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
      name: String,
    },
    cheese: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
      name: String,
    },
    vegetables: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
        name: String,
      },
    ],
  },

  presetPizzaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pizza",
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    orderStatus: {
      type: String,
      enum: [
        "Order Received",
        "In Kitchen",
        "Sent to Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Received",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
