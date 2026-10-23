const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pizza name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    category: {
      type: String,
      enum: ['Veg', 'Non-Veg'],
      default: 'Veg',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    recipe: {
      base: {
        type: String,
        default: 'Thin Crust',
      },
      sauce: {
        type: String,
        default: 'Classic Tomato Herb',
      },
      cheese: {
        type: String,
        default: 'Fresh Mozzarella',
      },
      vegetables: [
        {
          type: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pizza', pizzaSchema);
