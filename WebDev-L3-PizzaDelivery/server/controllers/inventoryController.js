const InventoryItem = require("../models/InventoryItem");

/**
 * @desc    Get all inventory items (public for custom builder & admin dashboard)
 * @route   GET /api/inventory
 * @access  Public
 */
const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({}).sort({ category: 1, name: 1 });

    const categorized = {
      bases: items.filter((i) => i.category === "base"),
      sauces: items.filter((i) => i.category === "sauce"),
      cheeses: items.filter((i) => i.category === "cheese"),
      vegetables: items.filter((i) => i.category === "vegetable"),
    };

    res.status(200).json({
      success: true,
      count: items.length,
      items,
      categorized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve inventory items.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update stock quantity & threshold manually by Admin
 * @route   PUT /api/inventory/:id
 * @access  Private / Admin
 */
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, threshold, unitPrice, isAvailable } = req.body;

    const item = await InventoryItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    if (stock !== undefined) item.stock = Math.max(0, Number(stock));
    if (threshold !== undefined)
      item.threshold = Math.max(0, Number(threshold));
    if (unitPrice !== undefined)
      item.unitPrice = Math.max(0, Number(unitPrice));
    if (isAvailable !== undefined) item.isAvailable = Boolean(isAvailable);

    await item.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("inventoryUpdated", {
        itemId: item._id,
        item,
      });
    }

    res.status(200).json({
      success: true,
      message: `Inventory for '${item.name}' updated successfully.`,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update inventory item.",
      error: error.message,
    });
  }
};

/**
 * @desc    Add new inventory item by Admin
 * @route   POST /api/inventory
 * @access  Private / Admin
 */
const addInventoryItem = async (req, res) => {
  try {
    const {
      name,
      category,
      stock,
      unitPrice,
      threshold,
      imageUrl,
      description,
    } = req.body;

    if (!name || !category || stock === undefined || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, stock, and unitPrice are required.",
      });
    }

    const existing = await InventoryItem.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An inventory item with this name already exists.",
      });
    }

    const newItem = await InventoryItem.create({
      name,
      category,
      stock: Number(stock),
      unitPrice: Number(unitPrice),
      threshold: threshold !== undefined ? Number(threshold) : 20,
      imageUrl: imageUrl || "",
      description: description || "",
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("inventoryUpdated", { itemId: newItem._id, item: newItem });
    }

    res.status(201).json({
      success: true,
      message: `Ingredient '${newItem.name}' added successfully.`,
      item: newItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add inventory item.",
      error: error.message,
    });
  }
};

module.exports = {
  getInventory,
  updateStock,
  addInventoryItem,
};
