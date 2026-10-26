import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  XCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleQuickFillCustomer = () => {
    setFormData({
      email: 'aryan@example.com',
      password: 'Password@123'
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMessage(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Server error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-xl shadow-orange-600/30 mb-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
            Welcome Back to Slice<span className="text-orange-500">Craft</span>
          </h1>
          <p className="text-sm text-stone-400 mt-2">
            Sign in to access your orders, saved addresses, and express checkout.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-2xl relative overflow-hidden">
          
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Quick Demo Fill Pill */}
          <div className="mb-6 p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-orange-300">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Need a test account?</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFillCustomer}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-500 text-stone-950 hover:bg-orange-400 transition-colors"
            >
              Auto Fill
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aryan@example.com"
                  required
                  className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-stone-950 font-bold text-sm shadow-lg shadow-orange-600/30 transition-all duration-200 mt-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to SliceCraft</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Links Footer */}
          <div className="mt-6 pt-6 border-t border-stone-800/80 space-y-3 text-center">
            <p className="text-xs text-stone-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4">
                Create one now
              </Link>
            </p>
            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-purple-400 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Kitchen Staff / Administrator Login</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
