import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Pizza,
  Sparkles,
  ShoppingBag,
  User,
  Shield,
  Menu as MenuIcon,
  X,
  LogOut,
  ChevronDown,
  Clock,
  Flame,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout, cart, lowStockCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Strict role evaluation
  const isLoggedIn = Boolean(user);
  const isAdmin = Boolean(user && user.role === 'admin');
  const isUser = Boolean(user && user.role !== 'admin');

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity (Dark Theme with Orange Glowing Logo) */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-105 transition-all duration-300">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white font-display">
                  Slice<span className="text-orange-500">Craft</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Woodfired
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-medium">Artisan Pizza Studio</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            
            {/* 1. Menu Link */}
            <Link
              to="/"
              id="navbar-menu-link"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/')
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Pizza className="w-4 h-4 text-orange-400" />
              <span>Menu</span>
            </Link>

            {/* 2. Custom Pizza Link */}
            <Link
              to="/custom-pizza"
              id="navbar-custom-pizza-link"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/custom-pizza')
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Custom Pizza</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500 text-neutral-950">
                Studio
              </span>
            </Link>

            {/* 3. Cart Link */}
            <Link
              to="/order-summary"
              id="navbar-cart-nav-link"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/order-summary')
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-600 text-white text-xs font-black flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* CONDITIONAL 1: If user role is 'user' -> Show "My Orders" */}
            {isUser && (
              <Link
                to="/order-tracking"
                id="navbar-my-orders-link"
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/order-tracking')
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>My Orders</span>
              </Link>
            )}

            {/* CONDITIONAL 2: If user role is 'admin' -> Show "Admin Panel" instead of "My Orders" */}
            {isAdmin && (
              <Link
                to="/admin/orders"
                id="navbar-admin-panel-link"
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-orange-500/15 text-amber-400 border border-orange-500/30 hover:bg-orange-500/25'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Panel</span>
                {lowStockCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            )}

            {/* Note: If user is NOT logged in, neither "My Orders" nor "Admin Panel" is shown */}

          </nav>

          {/* Right Action Controls: Cart Quick Button & User Auth States */}
          <div className="flex items-center gap-3">

            {/* Quick Cart Icon with Live Badge */}
            <Link
              to="/order-summary"
              id="navbar-cart-btn"
              className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 text-neutral-200 hover:text-orange-400 hover:bg-neutral-850 transition-all duration-200 group"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-extrabold flex items-center justify-center shadow-lg shadow-orange-600/40 animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Conditional User Buttons */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  id="navbar-user-menu-btn"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white transition-all text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-xs border border-orange-500/30">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline-block max-w-[110px] truncate">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-2xl p-2 z-50 text-sm backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-neutral-800">
                      <p className="text-xs text-neutral-400">Signed in as</p>
                      <p className="font-semibold text-white truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        isAdmin
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {user.role || 'User'}
                      </span>
                    </div>

                    <div className="py-1">
                      {/* If user: My Orders link */}
                      {isUser && (
                        <Link
                          to="/order-tracking"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span>My Orders</span>
                        </Link>
                      )}

                      {/* If admin: Admin Panel Links */}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-400" />
                            <span>Kitchen Orders Panel</span>
                          </Link>
                          <Link
                            to="/admin/inventory"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>Stock Sentinel</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-neutral-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If User is NOT logged in: Show Sign In & Register */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  id="navbar-signin-btn"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-neutral-950 font-bold text-xs shadow-md shadow-orange-600/20 transition-all duration-200"
                >
                  <User className="w-3.5 h-3.5 text-neutral-950" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  id="navbar-register-btn"
                  className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-semibold transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/98 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
          <div className="space-y-1">
            
            {/* Menu */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive('/')
                  ? 'bg-orange-500/20 text-orange-400 font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Pizza className="w-5 h-5 text-orange-400" />
                <span>Menu</span>
              </div>
            </Link>

            {/* Custom Pizza */}
            <Link
              to="/custom-pizza"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive('/custom-pizza')
                  ? 'bg-orange-500/20 text-orange-400 font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Custom Pizza</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500 text-neutral-950">
                Studio
              </span>
            </Link>

            {/* Cart */}
            <Link
              to="/order-summary"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <span>Cart</span>
              </div>
              {totalCartCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-neutral-950 text-xs font-bold">
                  {totalCartCount} items
                </span>
              )}
            </Link>

            {/* CONDITIONAL 1: If user -> Show "My Orders" */}
            {isUser && (
              <Link
                to="/order-tracking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-amber-400 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>My Orders</span>
                </div>
              </Link>
            )}

            {/* CONDITIONAL 2: If admin -> Show "Admin Panel" instead of "My Orders" */}
            {isAdmin && (
              <div className="pt-2 pb-1 border-t border-neutral-850 space-y-1">
                <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Kitchen Administration
                </div>
                <Link
                  to="/admin/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-amber-400 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                  <Shield className="w-5 h-5 text-amber-500" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            )}

            {/* Note: If not logged in, neither "My Orders" nor "Admin Panel" is rendered */}
          </div>

          {/* User Auth Footer for Mobile */}
          <div className="pt-3 border-t border-neutral-800">
            {isLoggedIn ? (
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-sm border border-orange-500/30">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-400 hover:text-rose-300"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl bg-orange-500 text-neutral-950 font-bold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl bg-neutral-800 text-neutral-200 font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
