const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["base", "sauce", "cheese", "vegetable"],
      index: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      min: [0, "Stock cannot be negative"],
      default: 50,
    },
    unitPrice: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 20,
    },
    threshold: {
      type: Number,
      required: true,
      default: 20,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

inventoryItemSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.threshold;
});

inventoryItemSchema.set("toJSON", { virtuals: true });
inventoryItemSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
