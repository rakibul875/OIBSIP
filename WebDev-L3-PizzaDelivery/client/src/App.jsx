import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';

// Customer Pages
import UserDashboard from './pages/UserDashboard';
import CustomPizzaBuilder from './pages/CustomPizzaBuilder';
import OrderSummary from './pages/OrderSummary';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import InventoryManagement from './pages/admin/InventoryManagement';
import AdminOrderPanel from './pages/admin/AdminOrderPanel';

// Scroll to top on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 selection:bg-orange-500 selection:text-white">
      <ScrollToTop />
      
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content Router */}
      <main className="flex-1">
        <Routes>
          {/* Customer / User Routes */}
          <Route path="/" element={<UserDashboard />} />
          <Route path="/menu" element={<Navigate to="/" replace />} />
          <Route path="/custom-pizza" element={<CustomPizzaBuilder />} />
          <Route path="/cart" element={<Navigate to="/order-summary" replace />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/track" element={<Navigate to="/order-tracking" replace />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/inventory" replace />} />
          <Route path="/admin/inventory" element={<InventoryManagement />} />
          <Route path="/admin/orders" element={<AdminOrderPanel />} />

          {/* Fallback wildcard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Interactive Global Toast Alert */}
      <NotificationToast />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
