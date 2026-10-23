const express = require('express');
const router = express.Router();
const { getPresetPizzas, createPresetPizza } = require('../controllers/pizzaController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getPresetPizzas);
router.post('/', verifyToken, requireAdmin, createPresetPizza);

module.exports = router;
