const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';

    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
};

module.exports = getRazorpayInstance;
