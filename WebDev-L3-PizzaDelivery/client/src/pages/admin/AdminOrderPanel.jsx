import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { joinAdminDispatchRoom } from '../../services/socket';
import {
  Pizza,
  Clock,
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Flame,
  User,
  ShoppingBag,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

export default function AdminOrderPanel() {
  const {
    orders,
    ordersLoading,
    fetchOrders,
    updateOrderStatus,
    lowStockCount
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const filterOptions = [
    'All',
    'Order Received',
    'In Kitchen',
    'Sent to Delivery',
    'Delivered'
  ];

  // Subscribe to real-time admin dispatch socket room & load orders
  useEffect(() => {
    joinAdminDispatchRoom();
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const oid = (order._id || order.id || '').toString();
    const custName = (
      order.deliveryAddress?.fullName ||
      order.customer?.name ||
      order.user?.name ||
      ''
    ).toString();
    const custEmail = (
      order.user?.email ||
      order.customer?.email ||
      ''
    ).toString();
    const custPhone = (
      order.deliveryAddress?.phone ||
      order.customer?.phone ||
      ''
    ).toString();

    // Map legacy / alternative status strings if needed
    let currentStatus = order.orderStatus || 'Order Received';
    if (currentStatus === 'In the Kitchen' || currentStatus === 'Baking in Oven') {
      currentStatus = 'In Kitchen';
    } else if (currentStatus === 'Out for Delivery') {
      currentStatus = 'Sent to Delivery';
    }

    const matchesStatus =
      statusFilter === 'All' ||
      order.orderStatus === statusFilter ||
      currentStatus === statusFilter;

    const matchesSearch =
      oid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custPhone.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(
        orderId,
        newStatus,
        `Kitchen supervisor updated status to: ${newStatus}`
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Order Received':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse';
      case 'In Kitchen':
      case 'In the Kitchen':
      case 'Baking in Oven':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Sent to Delivery':
      case 'Out for Delivery':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-neutral-950 text-neutral-100">
      
      {/* 1. Dashboard Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-neutral-800">
        <div>
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-amber-500 text-xs font-bold tracking-wider uppercase mb-2.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>KITCHEN COMMAND CENTER</span>
          </div>

          {/* Main Title & Subtitle */}
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
            Admin Operations Dashboard
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Real-time kitchen order dispatch & automated stock sentinel
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
          <Link
            to="/admin/orders"
            id="tab-live-orders"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-orange-600 text-white shadow-lg shadow-orange-600/30"
          >
            <Pizza className="w-4 h-4" />
            <span>Live Orders</span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-950/40 text-white text-[10px] font-mono">
              {orders.length}
            </span>
          </Link>

          <Link
            to="/admin/inventory"
            id="tab-stock-sentinel"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <Shield className="w-4 h-4 text-amber-500" />
            <span>Stock Sentinel</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                {lowStockCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => fetchOrders()}
            className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Filter Buttons Row & Search Input */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
        
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {filterOptions.map((f) => {
            const isSelected = statusFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-500 text-white shadow-md shadow-orange-600/30 scale-102'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850 hover:border-neutral-700'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="w-full lg:w-80 relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Name, Phone..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* 3. Orders Grid & Cards */}
      {ordersLoading && orders.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
          <Flame className="w-10 h-10 text-orange-500 animate-bounce mx-auto" />
          <h3 className="text-lg font-bold text-white">Syncing Kitchen Orders...</h3>
          <p className="text-xs text-neutral-400">Loading incoming orders from live database.</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const oid = (order._id || order.id || '').toString();
            // Formatted uppercase Hex Order ID as requested (e.g. #2CD68B)
            const displayOid = `#${(oid.slice(-6) || '2CD68B').toUpperCase()}`;

            const custName =
              order.deliveryAddress?.fullName ||
              order.customer?.name ||
              order.user?.name ||
              'Customer';

            const custEmail =
              order.user?.email ||
              order.customer?.email ||
              'customer@slicecraft.com';

            const custPhone =
              order.deliveryAddress?.phone ||
              order.customer?.phone ||
              '+91 98765 43210';

            const deliveryNotes =
              order.deliveryAddress?.instructions ||
              'Standard contactless doorstep delivery.';

            const fullAddress = order.deliveryAddress?.street
              ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city || ''} ${order.deliveryAddress.zipCode ? `- ${order.deliveryAddress.zipCode}` : ''}`
              : 'Delivery Address Provided at Checkout';

            const orderDateStr = order.createdAt || order.orderDate;

            return (
              <div
                key={oid}
                id={`order-card-${oid}`}
                className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-orange-500 rounded-3xl p-6 shadow-xl transition-all hover:border-neutral-700/80 space-y-5"
              >
                {/* Order Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                  
                  {/* Left: Order ID, Price badge, and Payment Status ("PAID" in green) */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg sm:text-xl font-black text-white font-mono tracking-wider">
                      {displayOid}
                    </span>

                    {/* Price Badge */}
                    <div className="bg-neutral-950 px-3 py-1 rounded-xl text-white font-mono font-bold text-sm border border-neutral-800 flex items-center gap-1 shadow-inner">
                      <span className="text-xs text-neutral-400">Total:</span>
                      <span className="text-amber-500">₹{order.totalAmount}</span>
                    </div>

                    {/* Payment Status Badge: "PAID" in green */}
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PAID</span>
                    </span>

                    {/* Order Status Badge */}
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${getStatusBadgeStyle(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Right: Timestamp */}
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {orderDateStr
                        ? new Date(orderDateStr).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Just now'}
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-400">{order.estimatedDeliveryTime || '25 min ETA'}</span>
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Customer Details Section (4 Cols) */}
                  <div className="lg:col-span-4 bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/70 space-y-2.5 text-xs">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                      Customer & Coordinates
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{custName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-300">
                        <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{custEmail}</span>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-300">
                        <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span>{custPhone}</span>
                      </div>

                      <div className="flex items-start gap-2 text-neutral-300 pt-1 border-t border-neutral-850">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{fullAddress}</span>
                      </div>

                      {/* Delivery Notes */}
                      <div className="flex items-start gap-2 text-neutral-400 pt-1 border-t border-neutral-850">
                        <FileText className="w-3.5 h-3.5 text-amber-500/80 shrink-0 mt-0.5" />
                        <span className="italic line-clamp-2">
                          "{deliveryNotes}"
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Item List Section (5 Cols) */}
                  <div className="lg:col-span-5 bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/70 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3 text-amber-500" />
                        <span>Kitchen Ticket ({order.items?.length || 0} items)</span>
                      </p>
                      <span className="text-[10px] text-neutral-400">Fresh Woodfired</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {order.items?.map((item, idx) => {
                        const isCustom = item.pizzaType === 'custom' || item.type === 'custom';
                        const baseName = item.customDetails?.base?.name || item.customDetails?.base;
                        const sauceName = item.customDetails?.sauce?.name || item.customDetails?.sauce;
                        const cheeseName = item.customDetails?.cheese?.name || item.customDetails?.cheese;
                        const vegList = (item.customDetails?.vegetables || []).map((v) => v.name || v);

                        return (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-200 space-y-1"
                          >
                            <div className="flex justify-between items-center font-medium">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-extrabold text-amber-500 font-mono">
                                  {item.quantity}x
                                </span>
                                <span className="text-white font-semibold truncate">
                                  {item.name}
                                </span>
                              </div>
                              <span className="font-mono text-neutral-300 font-bold shrink-0">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>

                            {/* Custom Pizza Ingredients breakdown */}
                            {isCustom && (
                              <div className="text-[11px] text-neutral-400 pl-4 border-l-2 border-orange-500/30 py-0.5 space-y-0.5">
                                <p>
                                  <span className="text-neutral-500">Crust:</span> {baseName || 'Signature Woodfired'} • <span className="text-neutral-500">Sauce:</span> {sauceName || 'San Marzano'}
                                </p>
                                <p>
                                  <span className="text-neutral-500">Cheese:</span> {cheeseName || 'Mozzarella'}
                                  {vegList.length > 0 && ` • Toppings: ${vegList.join(', ')}`}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Update Dropdown Section (3 Cols) */}
                  <div className="lg:col-span-3 bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/70 space-y-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3 h-3 text-amber-500" />
                      <span>Instant Status Dispatch</span>
                    </p>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1.5">
                        Change Order Phase:
                      </label>
                      <select
                        value={order.orderStatus}
                        disabled={updatingOrderId === oid}
                        onChange={(e) => handleStatusChange(oid, e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer disabled:opacity-50 transition-all shadow"
                      >
                        <option value="Order Received">Order Received</option>
                        <option value="In Kitchen">In Kitchen</option>
                        <option value="Sent to Delivery">Sent to Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-[10px] text-neutral-400 space-y-1">
                      <p className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        WebSocket Sync
                      </p>
                      <p>
                        Status broadcasts immediately to live customer tracking & email dispatch.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
          <Pizza className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-neutral-400">
            No live kitchen orders match status "{statusFilter}".
          </p>
          <button
            onClick={() => {
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
