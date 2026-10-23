const express = require("express");
const router = express.Router();
const {
  getInventory,
  updateStock,
  addInventoryItem,
} = require("../controllers/inventoryController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

router.get("/", getInventory);

router.put("/:id", verifyToken, requireAdmin, updateStock);
router.post("/", verifyToken, requireAdmin, addInventoryItem);

module.exports = router;
