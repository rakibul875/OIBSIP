import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, pizzaService, inventoryService, orderService } from '../services/api';
import { getSocket } from '../services/socket';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('slicecraft_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [authLoading, setAuthLoading] = useState(false);

  // 2. Dynamic Inventory State (Bases, Sauces, Cheeses, Vegetables)
  const [bases, setBases] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [cheeses, setCheeses] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // 3. Dynamic Preset Pizza Catalog
  const [pizzas, setPizzas] = useState([]);
  const [pizzasLoading, setPizzasLoading] = useState(true);

  // 4. Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('slicecraft_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupon, setCoupon] = useState(null);

  // 5. Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(() => {
    return localStorage.getItem('slicecraft_active_order') || '';
  });

  // 6. Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('slicecraft_cart', JSON.stringify(cart));
  }, [cart]);

  // Save Active Order ID to LocalStorage
  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('slicecraft_active_order', activeOrderId);
    }
  }, [activeOrderId]);

  // =========================================================================
  // DATA FETCHING FUNCTIONS
  // =========================================================================

  // Fetch Inventory from live backend
  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const res = await inventoryService.getInventory();
      if (res.data.success) {
        const rawItems = res.data.items || [];
        setAllInventory(rawItems);

        const categorized = res.data.categorized || {
          bases: rawItems.filter((i) => i.category === 'base'),
          sauces: rawItems.filter((i) => i.category === 'sauce'),
          cheeses: rawItems.filter((i) => i.category === 'cheese'),
          vegetables: rawItems.filter((i) => i.category === 'vegetable'),
        };

        setBases(categorized.bases || []);
        setSauces(categorized.sauces || []);
        setCheeses(categorized.cheeses || []);
        setVegetables(categorized.vegetables || []);
      }
    } catch (err) {
      console.error('[API Fetch Error] Failed to fetch inventory:', err.message);
      showToast('Could not sync live inventory from server.', 'error');
    } finally {
      setInventoryLoading(false);
    }
  }, [showToast]);

  // Fetch Preset Pizzas from live backend
  const fetchPizzas = useCallback(async () => {
    setPizzasLoading(true);
    try {
      const res = await pizzaService.getPresetPizzas();
      if (res.data.success) {
        setPizzas(res.data.pizzas || []);
      }
    } catch (err) {
      console.error('[API Fetch Error] Failed to fetch pizzas:', err.message);
      showToast('Could not load pizza catalog from server.', 'error');
    } finally {
      setPizzasLoading(false);
    }
  }, [showToast]);

  // Fetch Orders based on user role (Admin vs Customer)
  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('slicecraft_token');
    if (!token) return;

    setOrdersLoading(true);
    try {
      let res;
      if (user?.role === 'admin') {
        res = await orderService.getAllOrdersAdmin();
      } else {
        res = await orderService.getMyOrders();
      }

      if (res.data.success) {
        const orderList = res.data.orders || [];
        setOrders(orderList);

        if (!activeOrderId && orderList.length > 0) {
          setActiveOrderId(orderList[0]._id || orderList[0].id);
        }
      }
    } catch (err) {
      console.warn('[API Fetch Notice] Could not load orders:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [user, activeOrderId]);

  // Initial Data Load
  useEffect(() => {
    fetchInventory();
    fetchPizzas();
  }, [fetchInventory, fetchPizzas]);

  // Fetch Orders when user logs in / changes
  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user, fetchOrders]);

  // =========================================================================
  // REAL-TIME WEBSOCKET LISTENERS
  // =========================================================================
  useEffect(() => {
    const socket = getSocket();

    const handleInventoryUpdated = ({ item }) => {
      if (!item) return;
      setAllInventory((prev) =>
        prev.map((i) => (i._id === item._id || i.id === item._id ? item : i))
      );

      const updateCategory = (list) =>
        list.map((i) => (i._id === item._id || i.id === item._id ? item : i));

      if (item.category === 'base') setBases(updateCategory);
      if (item.category === 'sauce') setSauces(updateCategory);
      if (item.category === 'cheese') setCheeses(updateCategory);
      if (item.category === 'vegetable') setVegetables(updateCategory);
    };

    const handleBatchInventoryUpdated = (updatedItems) => {
      if (!Array.isArray(updatedItems)) return;
      const idMap = new Map(updatedItems.map((it) => [it._id.toString(), it]));

      const batchUpdate = (list) =>
        list.map((it) => idMap.get((it._id || it.id).toString()) || it);

      setAllInventory((prev) => batchUpdate(prev));
      setBases((prev) => batchUpdate(prev));
      setSauces((prev) => batchUpdate(prev));
      setCheeses((prev) => batchUpdate(prev));
      setVegetables((prev) => batchUpdate(prev));
    };

    const handleOrderStatusUpdated = ({ orderId, newStatus, updatedOrder }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId || o.id === orderId
            ? updatedOrder || { ...o, orderStatus: newStatus }
            : o
        )
      );

      showToast(`Order status updated to: ${newStatus}`, 'info');
    };

    const handleNewIncomingOrder = (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      if (user?.role === 'admin') {
        showToast(`🔔 New Incoming Order #${newOrder._id || newOrder.id} received!`, 'success');
      }
    };

    socket.on('inventoryUpdated', handleInventoryUpdated);
    socket.on('inventoryBatchUpdated', handleBatchInventoryUpdated);
    socket.on('orderStatusUpdated', handleOrderStatusUpdated);
    socket.on('newIncomingOrder', handleNewIncomingOrder);

    return () => {
      socket.off('inventoryUpdated', handleInventoryUpdated);
      socket.off('inventoryBatchUpdated', handleBatchInventoryUpdated);
      socket.off('orderStatusUpdated', handleOrderStatusUpdated);
      socket.off('newIncomingOrder', handleNewIncomingOrder);
    };
  }, [user, showToast]);

  // =========================================================================
  // AUTHENTICATION OPERATIONS
  // =========================================================================
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('slicecraft_token', token);
        localStorage.setItem('slicecraft_user', JSON.stringify(userData));
        setUser(userData);
        showToast(`Welcome back, ${userData.name}!`, 'success');
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await authService.adminLogin({ email, password });
      if (res.data.success) {
        const { token, user: adminData } = res.data;
        localStorage.setItem('slicecraft_token', token);
        localStorage.setItem('slicecraft_user', JSON.stringify(adminData));
        setUser(adminData);
        showToast('Admin Portal Unlocked! Welcome Head Chef.', 'success');
        return { success: true, user: adminData };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (userData) => {
    setAuthLoading(true);
    try {
      const res = await authService.register(userData);
      if (res.data.success) {
        showToast(res.data.message || 'Registration successful! Verification email sent.', 'success');
        return {
          success: true,
          message: res.data.message,
          devVerificationToken: res.data.devVerificationToken,
        };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('slicecraft_token');
    localStorage.removeItem('slicecraft_user');
    showToast('Signed out safely.', 'info');
  };

  // =========================================================================
  // CART OPERATIONS
  // =========================================================================
  const addToCart = (item) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity || 1;
        return updated;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    showToast(`Added ${item.name} to cart!`, 'success');
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from cart.', 'info');
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cartSubtotal === 0 ? 0 : cartSubtotal >= 500 ? 0 : 40;
  const gstTax = Math.round(cartSubtotal * 0.05); // 5% GST
  let discountAmount = 0;
  if (coupon === 'OASIS50') {
    discountAmount = Math.min(50, cartSubtotal);
  } else if (coupon === 'SLICECRAFT20') {
    discountAmount = Math.round(cartSubtotal * 0.2);
  }
  const cartTotal = Math.max(0, cartSubtotal + deliveryFee + gstTax - discountAmount);

  // =========================================================================
  // INVENTORY OPERATIONS (ADMIN)
  // =========================================================================
  const updateStock = async (itemId, newStock) => {
    try {
      const res = await inventoryService.updateStock(itemId, { stock: Number(newStock) });
      if (res.data.success) {
        showToast(res.data.message || 'Stock updated successfully!', 'success');
        fetchInventory();
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // =========================================================================
  // ORDER STATUS UPDATE (ADMIN)
  // =========================================================================
  const updateOrderStatus = async (orderId, newStatus, note = '') => {
    try {
      const res = await orderService.updateOrderStatus(orderId, { status: newStatus, note });
      if (res.data.success) {
        showToast(`Order status updated to '${newStatus}'!`, 'success');
        fetchOrders();
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // Safety threshold calculations (< 20 units)
  const lowStockThreshold = 20;
  const lowStockCount = allInventory.filter(
    (item) => item.stock <= (item.threshold || lowStockThreshold)
  ).length;

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        login,
        adminLogin,
        register,
        logout,
        bases,
        sauces,
        cheeses,
        vegetables,
        allInventory,
        inventoryLoading,
        fetchInventory,
        pizzas,
        pizzasLoading,
        fetchPizzas,
        updateStock,
        lowStockThreshold,
        lowStockCount,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        deliveryFee,
        gstTax,
        coupon,
        setCoupon,
        discountAmount,
        cartTotal,
        orders,
        ordersLoading,
        activeOrderId,
        setActiveOrderId,
        fetchOrders,
        updateOrderStatus,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
