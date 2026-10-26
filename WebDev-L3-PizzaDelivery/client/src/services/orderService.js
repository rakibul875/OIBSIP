import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://server-navy-two-90.vercel.app/api';

/**
 * Order & Payment Services for SliceCraft Pizza Delivery
 * Connects frontend client to Express / Razorpay backend endpoints.
 */

/**
 * Initialize a Razorpay Order and check ingredient stocks
 * @param {Object} orderPayload - { items, deliveryAddress }
 * @returns {Promise} Axios response with { success, razorpayOrder, keyId, amount }
 */
export const createRazorpayOrder = async (orderPayload) => {
  return await api.post('/orders/create-razorpay-order', orderPayload);
};

/**
 * Alias for createRazorpayOrder
 */
export const createOrder = async (orderPayload) => {
  return await createRazorpayOrder(orderPayload);
};

/**
 * Verify Razorpay payment signature & confirm order
 * @param {Object} paymentPayload - { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, deliveryAddress, totalAmount }
 * @returns {Promise} Axios response with confirmed order details
 */
export const verifyPayment = async (paymentPayload) => {
  return await api.post('/orders/verify-payment', paymentPayload);
};

/**
 * Fetch past and active orders for authenticated user
 * @returns {Promise} Axios response with array of user orders
 */
export const getMyOrders = async () => {
  return await api.get('/orders/my-orders');
};

/**
 * Fetch detailed single order by MongoDB ObjectId
 * @param {string} orderId 
 * @returns {Promise} Axios response with single order
 */
export const getOrderById = async (orderId) => {
  return await api.get(`/orders/detail/${orderId}`);
};

/**
 * Admin: Fetch all orders across system with optional status filter
 * @param {string} status - 'All' | 'Order Received' | 'In the Kitchen' | 'Baking in Oven' | 'Out for Delivery' | 'Delivered'
 * @returns {Promise} Axios response with orders array
 */
export const getAllOrdersAdmin = async (status) => {
  return await api.get('/orders/admin/all', {
    params: status && status !== 'All' ? { status } : {},
  });
};

/**
 * Admin: Update order status along with kitchen timeline note
 * @param {string} orderId 
 * @param {Object} statusData - { status, note }
 * @returns {Promise} Axios response with updated order
 */
export const updateOrderStatus = async (orderId, statusData) => {
  return await api.put(`/orders/${orderId}/status`, statusData);
};

export const orderService = {
  createRazorpayOrder,
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
  API_BASE_URL,
};

export default orderService;
