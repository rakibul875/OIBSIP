import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
  Package,
  Layers,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Save,
  Plus,
  RefreshCw,
  BellRing,
  Clock,
  Filter,
  TrendingDown
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'inventory'
  const { socket, joinAdminRoom } = useSocket();

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Inventory State
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ stock: 0, threshold: 20 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'vegetable',
    stock: 50,
    unitPrice: 30,
    threshold: 20,
    description: '',
  });

  const [notification, setNotification] = useState('');

  // 1. Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/admin/all?status=${orderStatusFilter}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // 2. Fetch Inventory
  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      if (res.data.success) {
        setInventory(res.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch admin inventory:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchInventory();
  }, [orderStatusFilter]);

  // 3. Socket.io Real-time Handlers
  useEffect(() => {
    if (!socket) return;

    joinAdminRoom();

    const handleNewOrder = (newOrder) => {
      console.log('[Admin Socket] New incoming order received:', newOrder);
      setNotification(`🔔 NEW ORDER #${newOrder._id.slice(-6).toUpperCase()} received from ${newOrder.user?.name || 'Customer'}!`);
      setOrders((prev) => [newOrder, ...prev]);

      setTimeout(() => setNotification(''), 7000);
    };

    const handleBatchInventory = (updatedList) => {
      console.log('[Admin Socket] Inventory deducted on order placement:', updatedList);
      fetchInventory();
    };

    socket.on('newIncomingOrder', handleNewOrder);
    socket.on('inventoryBatchUpdated', handleBatchInventory);
    socket.on('inventoryUpdated', handleBatchInventory);

    return () => {
      socket.off('newIncomingOrder', handleNewOrder);
      socket.off('inventoryBatchUpdated', handleBatchInventory);
      socket.off('inventoryUpdated', handleBatchInventory);
    };
  }, [socket]);

  // Update Order Status Handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Manual Stock Update Handler
  const startEditing = (item) => {
    setEditingId(item._id);
    setEditValues({ stock: item.stock, threshold: item.threshold });
  };

  const saveEditing = async (itemId) => {
    try {
      const res = await api.put(`/inventory/${itemId}`, editValues);
      if (res.data.success) {
        setInventory((prev) =>
          prev.map((item) => (item._id === itemId ? res.data.item : item))
        );
        setEditingId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
    }
  };

  // Add New Ingredient
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory', newItem);
      if (res.data.success) {
        setInventory((prev) => [...prev, res.data.item]);
        setShowAddForm(false);
        setNewItem({
          name: '',
          category: 'vegetable',
          stock: 50,
          unitPrice: 30,
          threshold: 20,
          description: '',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    }
  };

  // Grouped inventory counts
  const lowStockCount = inventory.filter((i) => i.stock <= i.threshold).length;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Toast Alert for New Orders */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '25px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '1.1rem 1.6rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'bounce 0.5s ease'
        }}>
          <BellRing size={24} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>Kitchen Dispatch Notification</strong>
            <span style={{ fontSize: '0.88rem' }}>{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>
            Kitchen Command Center
          </span>
          <h1 style={{ fontSize: '2.4rem' }}>Admin Operations Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time kitchen order dispatch & automated stock sentinel
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              background: activeTab === 'orders' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'orders' ? 'white' : 'var(--text-muted)',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition)'
            }}
          >
            <Package size={16} /> Live Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              background: activeTab === 'inventory' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'inventory' ? 'white' : 'var(--text-muted)',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition)'
            }}
          >
            <Layers size={16} /> Stock Sentinel
            {lowStockCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                fontSize: '0.7rem',
                width: '18px',
                height: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px'
              }}>
                {lowStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: ORDERS MANAGEMENT ===================== */}
      {activeTab === 'orders' && (
        <div>
          {/* Order Filters */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.8rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Filter size={16} color="var(--text-dim)" />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginRight: '6px' }}>Filter:</span>
              {['All', 'Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  style={{
                    background: orderStatusFilter === status ? 'rgba(255, 94, 40, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: orderStatusFilter === status ? 'var(--accent-orange)' : 'var(--text-muted)',
                    border: `1px solid ${orderStatusFilter === status ? 'var(--accent-orange)' : 'var(--border-glass)'}`,
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={fetchOrders}
              className="btn-secondary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Loading incoming kitchen orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              No orders matching '{orderStatusFilter}' found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="glass-panel"
                  style={{
                    padding: '1.75rem',
                    borderLeft: `4px solid ${
                      order.orderStatus === 'Order Received'
                        ? 'var(--accent-orange)'
                        : order.orderStatus === 'In Kitchen'
                        ? 'var(--accent-amber)'
                        : order.orderStatus === 'Sent to Delivery'
                        ? '#3b82f6'
                        : '#10b981'
                    }`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.2rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
                        <span className="badge badge-blue">₹{order.totalAmount}</span>
                        <span className="badge badge-green">Paid</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Customer: <strong style={{ color: 'var(--text-main)' }}>{order.user?.name || order.deliveryAddress?.fullName}</strong> ({order.user?.email}) • 📞 {order.deliveryAddress?.phone}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                      </div>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Update Status:</span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="form-select"
                        style={{
                          width: 'auto',
                          padding: '0.5rem 1rem',
                          background: '#161b26',
                          borderColor: 'var(--accent-orange)',
                          color: 'var(--text-main)',
                          fontWeight: 700
                        }}
                      >
                        <option value="Order Received">Order Received</option>
                        <option value="In Kitchen">In Kitchen</option>
                        <option value="Sent to Delivery">Sent to Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{
                    background: 'rgba(10, 12, 16, 0.5)',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <div>
                          <strong>{item.name}</strong> x{item.quantity}{' '}
                          {item.pizzaType === 'custom' && item.customDetails && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              [Sauce: {item.customDetails.sauce?.name}, Cheese: {item.customDetails.cheese?.name}
                              {item.customDetails.vegetables?.length > 0 &&
                                `, Veggies: ${item.customDetails.vegetables.map((v) => v.name).join(', ')}`}
                              ]
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: INVENTORY STOCK SENTINEL ===================== */}
      {activeTab === 'inventory' && (
        <div>
          {/* Quick Metrics Bar */}
          <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Tracked Ingredients</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                {inventory.length}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderColor: lowStockCount > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Low Stock Alert Items</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: lowStockCount > 0 ? '#ef4444' : '#10b981' }}>
                {lowStockCount} items
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Automated Cron Sentinel</span>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> Hourly Threshold Monitor Active
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Ingredient Stock Register</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary"
              style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem' }}
            >
              <Plus size={16} /> {showAddForm ? 'Cancel' : 'Add New Ingredient'}
            </button>
          </div>

          {/* Add Ingredient Form */}
          {showAddForm && (
            <form onSubmit={handleAddItem} className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>Add New Ingredient / Stock</h4>
              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">Ingredient Name</label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Buffalo Mozzarella"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="base">Base</option>
                    <option value="sauce">Sauce</option>
                    <option value="cheese">Cheese</option>
                    <option value="vegetable">Vegetable</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Stock Count</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newItem.threshold}
                    onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="form-input"
                    placeholder="Brief note on ingredient"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                Save Ingredient
              </button>
            </form>
          )}

          {/* Inventory Table */}
          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Current Stock</th>
                  <th style={{ padding: '1rem' }}>Threshold</th>
                  <th style={{ padding: '1rem' }}>Unit Price</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.stock <= item.threshold;
                  const isEditing = editingId === item._id;

                  return (
                    <tr
                      key={item._id}
                      style={{
                        borderBottom: '1px solid var(--border-glass)',
                        background: isLow ? 'rgba(239, 68, 68, 0.04)' : undefined
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                        {item.category}
                      </td>

                      {/* Stock Column (with inline editor) */}
                      <td style={{ padding: '1rem' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editValues.stock}
                            onChange={(e) => setEditValues({ ...editValues, stock: e.target.value })}
                            className="form-input"
                            style={{ width: '80px', padding: '4px 8px' }}
                          />
                        ) : (
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: isLow ? '#ef4444' : 'var(--text-main)' }}>
                            {item.stock}
                          </span>
                        )}
                      </td>

                      {/* Threshold Column */}
                      <td style={{ padding: '1rem' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            value={editValues.threshold}
                            onChange={(e) => setEditValues({ ...editValues, threshold: e.target.value })}
                            className="form-input"
                            style={{ width: '80px', padding: '4px 8px' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>{item.threshold}</span>
                        )}
                      </td>

                      <td style={{ padding: '1rem' }}>₹{item.unitPrice}</td>

                      <td style={{ padding: '1rem' }}>
                        {isLow ? (
                          <span className="badge badge-red">
                            <TrendingDown size={12} /> Low Stock Alert
                          </span>
                        ) : (
                          <span className="badge badge-green">Healthy</span>
                        )}
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {isEditing ? (
                          <button
                            onClick={() => saveEditing(item._id)}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#10b981' }}
                          >
                            <Save size={14} /> Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditing(item)}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            <Edit2 size={13} /> Edit Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
