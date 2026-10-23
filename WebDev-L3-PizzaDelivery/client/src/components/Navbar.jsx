import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  Pizza,
  ShoppingBag,
  User,
  LogOut,
  ShieldAlert,
  Sparkles,
  ChefHat,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getTotalCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = getTotalCount();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand-logo">
          <div
            style={{
              background: "linear-gradient(135deg, #ff5e28, #ea580c)",
              padding: "8px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(255, 94, 40, 0.4)",
            }}
          >
            <Pizza size={24} color="#ffffff" />
          </div>
          <span>
            Slice<span className="brand-gradient">Craft</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Menu
          </Link>

          <Link
            to="/custom-builder"
            className={`nav-link ${location.pathname === "/custom-builder" ? "active" : ""}`}
            style={{
              background: "rgba(255, 94, 40, 0.12)",
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1px solid rgba(255, 94, 40, 0.25)",
              color: "#ff7547",
              fontWeight: 600,
            }}
          >
            <ChefHat size={16} /> Custom Pizza
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
            >
              My Orders
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={`nav-link ${location.pathname.startsWith("/admin") ? "active" : ""}`}
              style={{ color: "#f59e0b", fontWeight: 600 }}
            >
              <ShieldAlert size={16} /> Admin Panel
            </Link>
          )}

          <Link
            to="/order-summary"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              padding: "8px 14px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-glass)",
              borderRadius: "20px",
              color: "var(--text-main)",
              transition: "var(--transition)",
            }}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "var(--accent-orange)",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "0.72rem",
                  fontWeight: "bold",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(255, 94, 40, 0.5)",
                }}
              >
                {cartCount}
              </span>
            )}
            <span
              style={{
                marginLeft: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Cart
            </span>
          </Link>

          {isAuthenticated ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.88rem",
                  color: "var(--text-muted)",
                }}
              >
                <User size={16} color="var(--accent-orange)" />
                <span
                  style={{
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name?.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <Link
                to="/login"
                className="btn-secondary"
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: "6px 16px", fontSize: "0.85rem" }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
