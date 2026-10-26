import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://server-navy-two-90.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Request Interceptor: Automatically attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('slicecraft_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred.';

    // If 401 Unauthorized occurs on protected routes (except during explicit login attempts)
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      // Clear expired token
      localStorage.removeItem('slicecraft_token');
      localStorage.removeItem('slicecraft_user');
    }

    return Promise.reject(new Error(customMessage));
  }
);

/* =========================================================================
   API ENDPOINTS
   ========================================================================= */

// 1. Authentication Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  getCurrentUser: () => api.get('/auth/me'),
};

// 2. Pizza Catalog Services
export const pizzaService = {
  getPresetPizzas: () => api.get('/pizzas'),
};

// 3. Inventory Services
export const inventoryService = {
  getInventory: () => api.get('/inventory'),
  updateStock: (id, stockData) => api.put(`/inventory/${id}`, stockData),
  addInventoryItem: (itemData) => api.post('/inventory', itemData),
};

// 4. Order & Payment Services
export const orderService = {
  createRazorpayOrder: (orderPayload) => api.post('/orders/create-razorpay-order', orderPayload),
  createOrder: (orderPayload) => api.post('/orders/create-razorpay-order', orderPayload),
  verifyPayment: (paymentPayload) => api.post('/orders/verify-payment', paymentPayload),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (orderId) => api.get(`/orders/detail/${orderId}`),
  getAllOrdersAdmin: (status) =>
    api.get('/orders/admin/all', {
      params: status && status !== 'All' ? { status } : {},
    }),
  updateOrderStatus: (orderId, statusData) =>
    api.put(`/orders/${orderId}/status`, statusData),
};

export default api;
