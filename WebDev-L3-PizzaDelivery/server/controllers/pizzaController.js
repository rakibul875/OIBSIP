const Pizza = require('../models/Pizza');

/**
 * @desc    Get all preset pizza varieties
 * @route   GET /api/pizzas
 * @access  Public
 */
const getPresetPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.find({}).sort({ isPopular: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pizza varieties.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new preset pizza (Admin only)
 * @route   POST /api/pizzas
 * @access  Private / Admin
 */
const createPresetPizza = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, isPopular, recipe } = req.body;

    if (!name || !description || !price || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and imageUrl are required.',
      });
    }

    const pizza = await Pizza.create({
      name,
      description,
      price: Number(price),
      imageUrl,
      category: category || 'Veg',
      isPopular: Boolean(isPopular),
      recipe: recipe || {},
    });

    res.status(201).json({
      success: true,
      message: 'Pizza variety created successfully.',
      pizza,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create pizza variety.',
      error: error.message,
    });
  }
};

module.exports = {
  getPresetPizzas,
  createPresetPizza,
};
