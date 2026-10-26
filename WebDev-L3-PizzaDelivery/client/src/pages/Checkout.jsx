import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { orderService } from '../services/orderService';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Building,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function Checkout() {
  const {
    user,
    cart,
    cartTotal,
    clearCart,
    setActiveOrderId,
    showToast
  } = useApp();

  const navigate = useNavigate();

  // Address Form State
  const [address, setAddress] = useState({
    fullName: user?.name || 'Aryan Patel',
    phone: user?.phone || '+91 98765 43210',
    street: 'Flat 402, Emerald Heights, 12th Main Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560038',
    instructions: 'Ring doorbell twice, leave at door'
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentTab, setPaymentTab] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [simulatedCardNumber, setSimulatedCardNumber] = useState('4000 0000 0000 0002');
  const [simulatedUpiId, setSimulatedUpiId] = useState('testuser@okaxis');
  const [createdRazorpayOrder, setCreatedRazorpayOrder] = useState(null);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Format cart items according to server/models/Order.js requirements
  const formatCartItemsForBackend = () => {
    return cart.map((item) => {
      const isCustom = item.type === 'custom' || item.pizzaType === 'custom';
      if (isCustom) {
        return {
          pizzaType: 'custom',
          name: item.name || 'Custom Artisan Pizza',
          price: Number(item.price),
          quantity: item.quantity || 1,
          customDetails: {
            base: {
              id: item.customDetails?.base?.id || item.customDetails?.base?._id,
              name: item.customDetails?.base?.name || item.customDetails?.base,
            },
            sauce: {
              id: item.customDetails?.sauce?.id || item.customDetails?.sauce?._id,
              name: item.customDetails?.sauce?.name || item.customDetails?.sauce,
            },
            cheese: {
              id: item.customDetails?.cheese?.id || item.customDetails?.cheese?._id,
              name: item.customDetails?.cheese?.name || item.customDetails?.cheese,
            },
            vegetables: (item.customDetails?.vegetables || []).map((v) => ({
              id: v.id || v._id,
              name: v.name || v,
            })),
          },
        };
      } else {
        return {
          pizzaType: 'preset',
          presetPizzaId: item.presetPizzaId || item.id || item._id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity || 1,
        };
      }
    });
  };

  /**
   * Helper to handle order verification on server & celebration
   */
  const verifyOrderOnServer = async (paymentPayload) => {
    setIsProcessingPayment(true);
    try {
      const res = await orderService.verifyPayment(paymentPayload);
      if (res.data?.success) {
        triggerSuccessFlow(res.data.order, res.data.message || 'Payment verified & Order Confirmed!');
      } else {
        showToast(res.data?.message || 'Payment verification failed.', 'error');
      }
    } catch (err) {
      console.error('[Verification Error]:', err.message);
      showToast(err.message || 'Payment verification error.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  /**
   * Trigger UI celebration, update active order state, and route to tracking
   */
  const triggerSuccessFlow = (confirmedOrder, successMessage) => {
    setShowRazorpayModal(false);
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#facc15', '#ef4444', '#10b981'],
      });
    } catch (e) {
      console.log('Confetti trigger:', e);
    }

    if (confirmedOrder) {
      const orderId = confirmedOrder._id || confirmedOrder.id;
      setActiveOrderId(orderId);
      localStorage.setItem('slicecraft_active_order', orderId);
    }

    clearCart();
    showToast(successMessage, 'success');
    navigate('/order-tracking');
  };

  /**
   * Step 1: Initiate Razorpay order creation on backend & trigger popup
   */
  const handleInitiatePayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // STRICT ADMIN RESTRICTION: Admin cannot order, only observe!
    if (user && user.role === 'admin') {
      showToast('You are admin, you cannot order, only observe!', 'error');
      return;
    }

    if (!address.fullName || !address.phone || !address.street || !address.zipCode) {
      showToast('Please fill all required delivery address fields.', 'warning');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      navigate('/');
      return;
    }

    const token = localStorage.getItem('slicecraft_token');
    if (!token) {
      showToast('Please sign in or register before checking out.', 'warning');
      navigate('/login');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const formattedItems = formatCartItemsForBackend();

      // If Cash on Delivery is selected, complete checkout immediately
      if (paymentMethod === 'cod') {
        const codOrderId = `order_cod_${Date.now()}`;
        const res = await orderService.verifyPayment({
          razorpay_order_id: codOrderId,
          razorpay_payment_id: `cod_${Date.now()}`,
          razorpay_signature: 'cod_signature',
          items: formattedItems,
          deliveryAddress: address,
          totalAmount: cartTotal,
        });

        if (res.data?.success) {
          triggerSuccessFlow(res.data.order, 'Order placed successfully with Cash on Delivery!');
          return;
        } else {
          showToast(res.data?.message || 'Failed to place COD order.', 'error');
          return;
        }
      }

      // Online Razorpay Payment Flow
      const res = await orderService.createRazorpayOrder({
        items: formattedItems,
        deliveryAddress: address,
      });

      if (res.data?.success) {
        const orderData = res.data.razorpayOrder;
        const keyId = res.data.keyId;
        setCreatedRazorpayOrder(orderData);

        // Check if official Razorpay checkout script is loaded and using real key
        const isRealKey = keyId && keyId !== 'rzp_test_placeholder_key';
        let launchedSdk = false;

        if (typeof window !== 'undefined' && window.Razorpay && isRealKey) {
          try {
            const options = {
              key: keyId,
              amount: orderData.amount,
              currency: orderData.currency || 'INR',
              name: 'SliceCraft Artisan Pizza Studio',
              description: 'Woodfired Pizza Delivery Order',
              order_id: orderData.id,
              handler: async (response) => {
                await verifyOrderOnServer({
                  razorpay_order_id: response.razorpay_order_id || orderData.id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items: formattedItems,
                  deliveryAddress: address,
                  totalAmount: cartTotal,
                });
              },
              prefill: {
                name: address.fullName,
                contact: address.phone,
                email: user?.email || '',
              },
              theme: {
                color: '#ea580c',
              },
              modal: {
                ondismiss: () => {
                  showToast('Payment window closed.', 'info');
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (errResp) => {
              showToast(errResp.error?.description || 'Payment failed.', 'error');
            });
            rzp.open();
            launchedSdk = true;
          } catch (sdkError) {
            console.warn('[Razorpay SDK Launch Warning]: Falling back to test modal simulator', sdkError);
            launchedSdk = false;
          }
        }

        // If official SDK did not launch (or test mode simulator is active), display test modal
        if (!launchedSdk) {
          setShowRazorpayModal(true);
        }
      } else {
        showToast(res.data?.message || 'Failed to initialize payment.', 'error');
      }
    } catch (err) {
      console.error('[Checkout Error]:', err.message);
      showToast(err.message || 'Error communicating with checkout server.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  /**
   * Step 2: Handle simulated sandbox payment confirmation
   */
  const handleSimulatePaymentSuccess = async () => {
    // STRICT ADMIN RESTRICTION: Admin cannot order, only observe!
    if (user && user.role === 'admin') {
      showToast('You are admin, you cannot order, only observe!', 'error');
      return;
    }

    if (!createdRazorpayOrder) {
      showToast('Order session not initialized. Please try again.', 'error');
      return;
    }

    const formattedItems = formatCartItemsForBackend();
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const mockSignature = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    await verifyOrderOnServer({
      razorpay_order_id: createdRazorpayOrder.id,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: mockSignature,
      items: formattedItems,
      deliveryAddress: address,
      totalAmount: cartTotal,
    });
  };

  const handleSimulatePaymentFailure = () => {
    setShowRazorpayModal(false);
    showToast('Payment was cancelled or unsuccessful.', 'error');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Checkout Title */}
      <div className="mb-8 pb-6 border-b border-stone-800">
        <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted 256-Bit Checkout</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
          Delivery Details & Payment
        </h1>
      </div>

      {/* Admin Observation Mode Notice */}
      {user?.role === 'admin' && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold uppercase tracking-wider block text-amber-400">
                Admin Observation Mode Active
              </span>
              <span className="text-amber-200/90">
                You are logged in as an administrator. You cannot place orders, only observe kitchen and inventory operations.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => showToast('You are admin, you cannot order, only observe!', 'error')}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 text-amber-400 border border-amber-500/30 font-bold text-xs"
          >
            Restriction Active
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Address & Details Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2 pb-3 border-b border-stone-800">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span>Delivery Coordinates</span>
            </h2>

            <form onSubmit={handleInitiatePayment} id="checkout-address-form" className="space-y-4">
              
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      required
                      placeholder="e.g. Aryan Patel"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                    Mobile Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                  Complete Street Address / Apartment / Flat No *
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    required
                    placeholder="Flat 402, Emerald Towers, 14th Main, Indiranagar"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    required
                    placeholder="Bengaluru"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    required
                    placeholder="Karnataka"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    required
                    placeholder="560038"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                  Delivery Notes / Gate Code (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    name="instructions"
                    value={address.instructions}
                    onChange={handleAddressChange}
                    placeholder="e.g. Ring bell twice, leave on porch table"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

            </form>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-panel rounded-3xl p-6 border border-stone-800 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-400" />
              <span>Select Payment Gateway</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'bg-orange-500/15 border-orange-500 shadow-lg shadow-orange-500/10'
                    : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Razorpay Checkout</span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Sandbox / Live
                    </span>
                  </div>
                  {paymentMethod === 'razorpay' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  Instant secure payment via Razorpay popup (Cards, UPI, NetBanking).
                </p>
              </div>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-orange-500/15 border-orange-500 shadow-lg shadow-orange-500/10'
                    : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Cash on Delivery</span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      COD
                    </span>
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  Pay with cash or scan delivery partner's QR code upon arrival.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary Brief & Pay Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          <div className="glass-panel rounded-3xl p-6 border border-stone-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-display pb-3 border-b border-stone-800">
              Order Review ({cart.length} items)
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {cart.map((item, idx) => (
                <div key={item.id || item._id || idx} className="flex items-center justify-between text-xs py-1.5">
                  <div className="flex-1 pr-2 truncate">
                    <span className="font-bold text-white">{item.quantity}x</span>{' '}
                    <span className="text-stone-300">{item.name}</span>
                  </div>
                  <span className="font-mono font-semibold text-stone-200">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-800 space-y-2 text-xs text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Total Payable:</span>
                <span className="text-2xl font-black text-white font-display">
                  ₹{cartTotal}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleInitiatePayment}
              id="pay-now-btn"
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all ${
                user?.role === 'admin'
                  ? 'bg-neutral-800 text-amber-400 border border-amber-500/40 cursor-not-allowed hover:bg-neutral-800'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-stone-950 shadow-orange-600/30 hover:scale-[1.01]'
              } disabled:opacity-50`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {user?.role === 'admin'
                  ? 'Admin Observation Mode (Orders Disabled)'
                  : isProcessingPayment
                  ? 'Connecting Gateway...'
                  : paymentMethod === 'razorpay'
                  ? `Pay ₹${cartTotal} via Razorpay`
                  : `Confirm Order (₹${cartTotal} COD)`}
              </span>
            </button>

            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800/80 text-[11px] text-stone-400 text-center">
              🔒 Safe & Secure Razorpay 256-Bit SSL Environment
            </div>
          </div>
        </div>

      </div>

      {/* RAZORPAY MODAL POPUP (Test Sandbox Simulation) */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl overflow-hidden animate-crust">
            
            {/* Razorpay Brand Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-white text-base">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Razorpay Checkout</h3>
                  <p className="text-[10px] text-blue-200">SliceCraft Artisan Pizza Studio</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-blue-200 block uppercase font-bold text-[9px]">Amount</span>
                <span className="text-lg font-black font-display">₹{cartTotal}</span>
              </div>
            </div>

            {/* Test Mode Notification Banner */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>TEST MODE: Simulated Razorpay payment flow for evaluation.</span>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-stone-800 bg-stone-950/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentTab('card')}
                className={`flex-1 py-3 border-b-2 transition-colors ${
                  paymentTab === 'card'
                    ? 'border-blue-500 text-blue-400 bg-stone-900'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                Cards (Test)
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('upi')}
                className={`flex-1 py-3 border-b-2 transition-colors ${
                  paymentTab === 'upi'
                    ? 'border-blue-500 text-blue-400 bg-stone-900'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('netbanking')}
                className={`flex-1 py-3 border-b-2 transition-colors ${
                  paymentTab === 'netbanking'
                    ? 'border-blue-500 text-blue-400 bg-stone-900'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                NetBanking
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-4">
              {paymentTab === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                      Dummy Card Number
                    </label>
                    <input
                      type="text"
                      value={simulatedCardNumber}
                      onChange={(e) => setSimulatedCardNumber(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-sm font-mono text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-sm font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        defaultValue="123"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-sm font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentTab === 'upi' && (
                <div className="space-y-3 text-center py-2">
                  <div className="w-24 h-24 mx-auto rounded-xl bg-white p-2 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-stone-900 border-dashed flex items-center justify-center font-bold text-stone-900 text-xs">
                      [UPI QR]
                    </div>
                  </div>
                  <input
                    type="text"
                    value={simulatedUpiId}
                    onChange={(e) => setSimulatedUpiId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-xs font-mono text-center text-white"
                  />
                </div>
              )}

              {paymentTab === 'netbanking' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-blue-500 text-stone-300 font-semibold text-center"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons: Success & Failure Triggers */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleSimulatePaymentSuccess}
                  id="simulate-payment-success-btn"
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isProcessingPayment ? 'Verifying Signature...' : `Confirm Payment (₹${cartTotal})`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleSimulatePaymentFailure}
                  className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Payment</span>
                </button>
              </div>

            </div>

            <div className="p-3 bg-stone-950 text-center text-[10px] text-stone-500 border-t border-stone-800">
              Razorpay Technologies Ltd. • 256-bit Encrypted Checkout
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
