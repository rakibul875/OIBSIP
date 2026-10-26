import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  ChevronLeft,
  Pizza,
  CheckCircle2
} from 'lucide-react';

export default function OrderSummary() {
  const {
    cart,
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
    showToast,
    user
  } = useApp();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();

    if (cleanCode === 'OASIS50') {
      setCoupon('OASIS50');
      setCouponError('');
      showToast('OASIS50 applied: Flat ₹50 discount!', 'success');
    } else if (cleanCode === 'SLICECRAFT20') {
      setCoupon('SLICECRAFT20');
      setCouponError('');
      showToast('SLICECRAFT20 applied: 20% off!', 'success');
    } else {
      setCouponError('Invalid coupon code. Try OASIS50 or SLICECRAFT20');
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError('');
    showToast('Coupon removed.', 'info');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md p-8 rounded-3xl glass-panel border border-stone-800 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-5 text-stone-600">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white font-display">Your Cart is Empty</h2>
          <p className="text-sm text-stone-400 mt-2 leading-relaxed">
            Looks like you haven't added any wood-fired artisan pies yet. Explore our handcrafted menu or build your own!
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-stone-950 font-bold text-sm shadow-lg shadow-orange-500/20 transition-all"
            >
              Browse Artisan Menu
            </Link>
            <Link
              to="/custom-pizza"
              className="w-full sm:w-auto px-6 py-3 rounded-xl glass-panel hover:bg-stone-800 text-stone-300 font-semibold text-sm transition-all"
            >
              Custom Pizza Studio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Review Items & Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
            Order Summary
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Add More Items</span>
          </Link>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Left: Item List, Right: Bill Breakdown & Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl glass-panel border border-stone-800/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Pizza className="w-8 h-8 text-orange-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-display">{item.name}</h3>
                    {item.type === 'custom' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        Custom Studio
                      </span>
                    )}
                  </div>

                  {/* Custom Pizza Ingredients Details */}
                  {item.type === 'custom' && item.customDetails && (
                    <div className="mt-2 text-xs text-stone-400 space-y-1">
                      <p>• <strong>Crust:</strong> {item.customDetails.base?.name || item.customDetails.base}</p>
                      <p>• <strong>Sauce:</strong> {item.customDetails.sauce?.name || item.customDetails.sauce}</p>
                      <p>• <strong>Cheese:</strong> {item.customDetails.cheese?.name || item.customDetails.cheese}</p>
                      {item.customDetails.vegetables?.length > 0 && (
                        <p>• <strong>Veggies:</strong> {item.customDetails.vegetables.map((v) => v.name || v).join(', ')}</p>
                      )}
                    </div>
                  )}

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-orange-400">₹{item.price} each</span>
                    <span className="text-xs text-stone-500">• Total: ₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Counter & Delete Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-800/60">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-stone-900 border border-stone-800">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-stone-500 hover:text-rose-400 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Delivery Note */}
          <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 text-xs text-stone-400 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Orders over <strong className="text-white">₹500</strong> automatically qualify for <strong>FREE thermal-express delivery</strong>!
            </span>
          </div>
        </div>

        {/* Right Column: Price Summary & Coupon (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          
          {/* Promo Code Box */}
          <div className="glass-panel rounded-3xl p-6 border border-stone-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-400" />
                <span>Have a Promo Code?</span>
              </h3>
              <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">
                OASIS50 / SLICECRAFT20
              </span>
            </div>

            {coupon ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Coupon <strong>{coupon}</strong> applied!</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-stone-400 hover:text-rose-400 font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter OASIS50 or SLICECRAFT20"
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase placeholder-stone-500 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 font-bold text-xs uppercase tracking-wider shrink-0 transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-xs text-rose-400">{couponError}</p>
            )}
          </div>

          {/* Itemized Price Breakdown */}
          <div className="glass-panel rounded-3xl p-6 border border-stone-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-display pb-3 border-b border-stone-800">
              Bill Breakdown
            </h3>

            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Cart Subtotal</span>
                <span className="font-semibold text-white">₹{cartSubtotal}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-emerald-400 font-semibold">FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">GST (5%) & Packaging</span>
                <span className="text-stone-300">₹{gstTax}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-₹{discountAmount}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 block">Total Amount:</span>
                <span className="text-3xl font-black text-white font-display">
                  ₹{cartTotal}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Tax Included
              </span>
            </div>

            {/* Proceed to Checkout CTA */}
            {user?.role === 'admin' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center font-medium">
                ⚠️ Admin observation mode: You cannot place orders.
              </div>
            )}

            <button
              onClick={() => {
                if (user?.role === 'admin') {
                  showToast('You are admin, you cannot order, only observe!', 'error');
                  return;
                }
                navigate('/checkout');
              }}
              id="proceed-to-checkout-btn"
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all ${
                user?.role === 'admin'
                  ? 'bg-neutral-800 text-amber-400 border border-amber-500/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-stone-950 shadow-orange-600/30 hover:scale-[1.01]'
              }`}
            >
              <span>{user?.role === 'admin' ? 'Admin Observation Only' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-stone-500">
              By proceeding, you agree to our terms of delivery & food safety.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
