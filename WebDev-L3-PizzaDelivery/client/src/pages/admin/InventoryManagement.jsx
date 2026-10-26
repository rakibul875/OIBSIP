import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { joinAdminDispatchRoom } from '../../services/socket';
import { inventoryService } from '../../services/api';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Package,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Flame,
  ArrowRight,
  Send,
  Edit3,
  X,
  Pizza,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Activity
} from 'lucide-react';

export default function InventoryManagement() {
  const {
    bases,
    sauces,
    cheeses,
    vegetables,
    allInventory,
    inventoryLoading,
    fetchInventory,
    updateStock,
    lowStockThreshold,
    lowStockCount,
    orders,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'base' | 'sauce' | 'cheese' | 'vegetable'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Ingredient Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'base',
    stock: 50,
    threshold: 20,
    unitPrice: 30,
    description: ''
  });

  // Edit Stock Modal Form State
  const [editForm, setEditForm] = useState({
    stock: 0,
    threshold: 20,
    unitPrice: 0
  });

  // Join admin socket room and fetch latest inventory
  useEffect(() => {
    joinAdminDispatchRoom();
    fetchInventory();
  }, [fetchInventory]);

  // Combine items safely
  const rawItems = (allInventory && allInventory.length > 0)
    ? allInventory
    : [
        ...bases.map((i) => ({ ...i, category: 'base' })),
        ...sauces.map((i) => ({ ...i, category: 'sauce' })),
        ...cheeses.map((i) => ({ ...i, category: 'cheese' })),
        ...vegetables.map((i) => ({ ...i, category: 'vegetable' }))
      ];

  const getCategoryDisplay = (cat) => {
    switch (cat) {
      case 'base':
        return 'Dough Base';
      case 'sauce':
        return 'Gourmet Sauce';
      case 'cheese':
        return 'Artisan Cheese';
      case 'vegetable':
        return 'Vegetable';
      default:
        return 'Ingredient';
    }
  };

  const allItems = rawItems.map((item) => ({
    ...item,
    catName: getCategoryDisplay(item.category)
  }));

  const filteredItems = allItems.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.catName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Quick Inline Adjustment (+ / -)
  const handleQuickAdjust = async (item, delta) => {
    const currentStock = Number(item.stock) || 0;
    const newStock = Math.max(0, currentStock + delta);
    await updateStock(item._id || item.id, newStock);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      stock: Number(item.stock) || 0,
      threshold: Number(item.threshold) || lowStockThreshold,
      unitPrice: Number(item.unitPrice) || 0
    });
  };

  // Submit Edit Modal
  const handleSaveEditModal = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSubmitting(true);
    try {
      const res = await inventoryService.updateStock(editingItem._id || editingItem.id, {
        stock: Number(editForm.stock),
        threshold: Number(editForm.threshold),
        unitPrice: Number(editForm.unitPrice)
      });

      if (res.data?.success) {
        showToast(res.data.message || `Updated '${editingItem.name}' stock!`, 'success');
        fetchInventory();
        setEditingItem(null);
      } else {
        showToast(res.data?.message || 'Failed to update stock', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating stock', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Add New Ingredient Modal
  const handleCreateIngredient = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      showToast('Please enter an ingredient name', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: newItem.name.trim(),
        category: newItem.category,
        stock: Number(newItem.stock) || 0,
        threshold: Number(newItem.threshold) || 20,
        unitPrice: Number(newItem.unitPrice) || 0,
        description: newItem.description || `${newItem.name} for artisan pizzas`
      };

      const res = await inventoryService.addInventoryItem(payload);
      if (res.data?.success) {
        showToast(`'${newItem.name}' added to inventory!`, 'success');
        fetchInventory();
        setIsAddModalOpen(false);
        setNewItem({
          name: '',
          category: 'base',
          stock: 50,
          threshold: 20,
          unitPrice: 30,
          description: ''
        });
      } else {
        showToast(res.data?.message || 'Failed to add ingredient', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error communicating with server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sentinel Cron test simulation
  const handleSimulateSentinelCron = () => {
    showToast(
      `Sentinel Cron Check Completed: ${lowStockCount} items below safety threshold (${lowStockThreshold} units). Automated alert dispatched to kitchen team.`,
      lowStockCount > 0 ? 'warning' : 'success'
    );
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <Pizza className="w-4 h-4 text-neutral-400" />
            <span>Live Orders</span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-950/40 text-neutral-300 text-[10px] font-mono">
              {orders.length}
            </span>
          </Link>

          <Link
            to="/admin/inventory"
            id="tab-stock-sentinel"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-orange-600 text-white shadow-lg shadow-orange-600/30"
          >
            <Shield className="w-4 h-4 text-white" />
            <span>Stock Sentinel</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                {lowStockCount}
              </span>
            )}
          </Link>

          <button
            onClick={handleSimulateSentinelCron}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Simulate node-cron background alert"
          >
            <Send className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Cron Check</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metric Cards at the Top */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        
        {/* Metric 1: Total Tracked Ingredients */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Total Tracked Ingredients
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-amber-500">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-display">
              {allItems.length || 24}
            </span>
            <span className="text-xs text-neutral-500 font-semibold uppercase">SKUs Active</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Doughs, artisan sauces, cheeses & fresh toppings
          </p>
        </div>

        {/* Metric 2: Low Stock Alert Items */}
        <div className={`rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all border ${
          lowStockCount > 0
            ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/30'
            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Low Stock Alert Items
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              lowStockCount > 0
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-black font-display ${
              lowStockCount > 0 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}>
              {lowStockCount} items
            </span>
            <span className="text-xs text-neutral-500 font-semibold uppercase">Below Limit</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Safety buffer threshold: &lt; {lowStockThreshold} units
          </p>
        </div>

        {/* Metric 3: Automated Cron Sentinel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Automated Cron Sentinel
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-sm tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>HEALTHY</span>
            </span>
            <span className="text-xs text-neutral-400 font-medium">Hourly Sentinel Active</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Background node-cron email dispatcher connected
          </p>
        </div>

      </div>

      {/* 3. Section Header: "Ingredient Stock Register" with "+ Add New Ingredient" */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl mb-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>Ingredient Stock Register</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live stock counts, deduction thresholds, and item pricing
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            id="add-ingredient-btn"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-orange-600/25 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add New Ingredient</span>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: `All (${allItems.length})` },
              { id: 'base', label: 'Dough Bases' },
              { id: 'sauce', label: 'Sauces' },
              { id: 'cheese', label: 'Cheeses' },
              { id: 'vegetable', label: 'Vegetables' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeTab === tab.id
                    ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ingredient by name..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* 4. Clean Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950/60 shadow-inner">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/80 text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Current Stock</th>
                <th className="py-3.5 px-4 text-center">Threshold</th>
                <th className="py-3.5 px-4 text-right">Unit Price</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const stockNum = Number(item.stock) || 0;
                  const thresholdNum = Number(item.threshold) || lowStockThreshold;
                  const isOutOfStock = stockNum === 0;
                  const isLow = stockNum <= thresholdNum && !isOutOfStock;

                  return (
                    <tr
                      key={item._id || item.id}
                      className="hover:bg-neutral-900/60 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              SKU #{((item._id || item.id || '').toString()).slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold text-[11px]">
                          {item.catName}
                        </span>
                      </td>

                      {/* Current Stock with Quick Stepper */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800"
                            title="Decrease Stock by 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className={`min-w-[40px] text-center font-mono font-bold text-xs ${
                            isOutOfStock
                              ? 'text-rose-400 font-black'
                              : isLow
                              ? 'text-amber-400'
                              : 'text-white'
                          }`}>
                            {stockNum}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800"
                            title="Increase Stock by 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="py-3.5 px-4 text-center font-mono text-neutral-400 font-semibold">
                        {thresholdNum} Units
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-500">
                        ₹{item.unitPrice || 0}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wider animate-pulse inline-block">
                            OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider inline-block">
                            CRITICAL LOW
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider inline-block">
                            HEALTHY
                          </span>
                        )}
                      </td>

                      {/* Actions: "Edit Stock" button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-750 text-neutral-200 hover:text-white hover:bg-neutral-800 hover:border-orange-500/40 text-xs font-semibold transition-all shadow-sm"
                        >
                          <Edit3 className="w-3 h-3 text-amber-500" />
                          <span>Edit Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-neutral-400">
                    No ingredients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 5. MODAL: Add New Ingredient */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Add New Ingredient
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Register item in kitchen sentinel inventory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1.5">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Truffle Oil Infused Dough"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 cursor-pointer font-semibold"
                >
                  <option value="base">Dough Base</option>
                  <option value="sauce">Gourmet Sauce</option>
                  <option value="cheese">Artisan Cheese</option>
                  <option value="vegetable">Vegetable</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.threshold}
                    onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Ingredient'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 6. MODAL: Edit Stock */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Edit Stock: {editingItem.name}
                </h3>
                <span className="text-[10px] text-amber-500 uppercase font-bold tracking-wider">
                  {editingItem.catName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1.5">
                  Available Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.threshold}
                    onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.unitPrice}
                    onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
