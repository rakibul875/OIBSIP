import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Trash2,
  Plus,
  Minus,
  CreditCard,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, getSubtotal } =
    useCart();
  const { user, isAuthenticated } = useAuth();

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/order-summary" } } });
      return;
    }

    if (
      !address.street ||
      !address.city ||
      !address.phone ||
      !address.zipCode
    ) {
      setErrorMsg("Please complete all delivery address and phone fields.");
      return;
    }

    if (cart.length === 0) {
      setErrorMsg("Your cart is empty. Add a delicious pizza first!");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/orders/create-razorpay-order", {
        items: cart,
        deliveryAddress: address,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to initialize payment.");
      }

      const { razorpayOrder, keyId } = res.data;

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SliceCraft Artisan Pizza",
        description: `Order Payment (${cart.length} item${cart.length > 1 ? "s" : ""})`,
        order_id: razorpayOrder.id,
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80",
        prefill: {
          name: address.fullName || user.name,
          email: user.email,
          contact: address.phone,
        },
        theme: {
          color: "#ff5e28",
        },
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/orders/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cart,
              deliveryAddress: address,
              totalAmount,
            });

            if (verifyRes.data.success) {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });

              clearCart();
              navigate("/dashboard", {
                state: { newOrderId: verifyRes.data.order._id },
              });
            }
          } catch (verifyErr) {
            setErrorMsg(
              verifyErr.response?.data?.message ||
                "Payment verification failed on server.",
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (failResp) => {
          setErrorMsg(
            failResp.error?.description || "Payment was declined or cancelled.",
          );
          setLoading(false);
        });
        rzp.open();
      } else {
        const confirmSim = window.confirm(
          "Razorpay Checkout script could not be reached (AdBlocker or offline). Proceed with Test Mode Simulated Payment?",
        );
        if (confirmSim) {
          const verifyRes = await api.post("/orders/verify-payment", {
            razorpay_order_id: razorpayOrder.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "simulated_test_signature",
            items: cart,
            deliveryAddress: address,
            totalAmount,
          });
          if (verifyRes.data.success) {
            clearCart();
            navigate("/dashboard");
          }
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Order checkout error:", err);
      setErrorMsg(
        err.response?.data?.message || err.message || "Checkout failed.",
      );
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "6rem 1.5rem" }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
          }}
        >
          <ShoppingBag size={36} color="var(--text-dim)" />
        </div>
        <h2 style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>
          Your Basket is Empty
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "2rem",
            maxWidth: "450px",
            margin: "0 auto 2rem auto",
          }}
        >
          Explore our artisan signature recipes or craft a custom pizza from
          scratch.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link to="/" className="btn-secondary">
            View Menu
          </Link>
          <Link to="/custom-builder" className="btn-primary">
            Custom Pizza Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>
        Order Review & Checkout
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem" }}>
        Confirm delivery coordinates and complete secure payment with Razorpay.
      </p>

      {errorMsg && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "1rem 1.25rem",
            borderRadius: "8px",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        <div>
          <div
            className="glass-panel"
            style={{ padding: "1.75rem", marginBottom: "2rem" }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ShoppingBag size={20} color="var(--accent-orange)" />
              Items in Your Order ({cart.length})
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
              }}
            >
              {cart.map((item) => (
                <div
                  key={item.cartId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "1.2rem",
                    borderBottom: "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ flexGrow: 1, paddingRight: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <h4 style={{ fontSize: "1.05rem" }}>{item.name}</h4>
                      <span
                        className={`badge ${item.pizzaType === "custom" ? "badge-orange" : "badge-amber"}`}
                        style={{ fontSize: "0.65rem" }}
                      >
                        {item.pizzaType}
                      </span>
                    </div>

                    {item.pizzaType === "custom" && item.customDetails && (
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-muted)",
                          marginTop: "4px",
                        }}
                      >
                        Sauce: {item.customDetails.sauce?.name} | Cheese:{" "}
                        {item.customDetails.cheese?.name}
                        {item.customDetails.vegetables?.length > 0 &&
                          ` | Veggies: ${item.customDetails.vegetables.map((v) => v.name).join(", ")}`}
                      </p>
                    )}
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "var(--accent-orange)",
                        marginTop: "4px",
                      }}
                    >
                      ₹{item.price} each
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "6px",
                        border: "1px solid var(--border-glass)",
                      }}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.cartId, item.quantity - 1)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        style={{
                          padding: "0 8px",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.cartId, item.quantity + 1)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-dim)",
                        cursor: "pointer",
                        padding: "6px",
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <h3
              style={{
                fontSize: "1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MapPin size={20} color="var(--accent-orange)" />
              Delivery Details
            </h3>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address & Landmark</label>
              <input
                type="text"
                name="street"
                value={address.street}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g. Flat 402, Sunshine Towers, MG Road"
              />
            </div>

            <div className="grid-cols-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g. Maharashtra"
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={address.zipCode}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g. 400001"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{ padding: "2rem", position: "sticky", top: "100px" }}
        >
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
            Payment Summary
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-muted)",
              }}
            >
              <span>Subtotal:</span>
              <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                ₹{subtotal}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-muted)",
              }}
            >
              <span>Express Kitchen Delivery:</span>
              <span
                style={{
                  color: deliveryFee === 0 ? "#10b981" : "var(--text-main)",
                  fontWeight: 600,
                }}
              >
                {deliveryFee === 0 ? "FREE (Orders > ₹500)" : `₹${deliveryFee}`}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-muted)",
              }}
            >
              <span>Taxes & GST:</span>
              <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                Included
              </span>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border-glass)",
                paddingTop: "1.2rem",
                marginTop: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                Total Payable:
              </span>
              <span
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: "var(--accent-orange)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                ₹{totalAmount}
              </span>
            </div>
          </div>

          <button
            onClick={handleRazorpayPayment}
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: "2rem",
              padding: "0.9rem",
              fontSize: "1.05rem",
            }}
          >
            {loading ? (
              "Securing Payment Gateway..."
            ) : (
              <>
                <CreditCard size={18} /> Pay ₹{totalAmount} with Razorpay
              </>
            )}
          </button>

          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--text-dim)",
              fontSize: "0.78rem",
            }}
          >
            <ShieldCheck size={16} color="var(--accent-green)" />
            <span>256-bit SSL Encrypted • Razorpay Test Mode Sandbox</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
