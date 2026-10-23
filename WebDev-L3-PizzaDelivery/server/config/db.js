require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slicecraft_pizza');
    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
