import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  XCircle,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export default function AdminLogin() {
  const { adminLogin } = useApp();
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

  const handleQuickFillAdmin = () => {
    setFormData({
      email: 'admin@slicecraft.com',
      password: 'Admin@12345'
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage('Admin email and master security password are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await adminLogin(formData.email, formData.password);
      if (res.success) {
        navigate('/admin/inventory');
      } else {
        setErrorMessage(res.message || 'Access denied: Invalid admin credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 shadow-xl shadow-purple-900/30 mb-4 border border-purple-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            Restricted Staff Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
            Kitchen Command Center
          </h1>
          <p className="text-sm text-stone-400 mt-2">
            Sign in with administrative privileges to manage inventory sentinel and live order dispatch.
          </p>
        </div>

        {/* Login Box */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl relative overflow-hidden bg-stone-900/90">
          
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Quick Admin Test Button */}
          <div className="mb-6 p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Internship Test Evaluation</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="text-xs font-bold px-3 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow"
            >
              Fill Admin Creds
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                Admin Master Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@slicecraft.com"
                  required
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                Admin Passkey
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Admin@12345"
                  required
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-purple-500 transition-all"
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

            <button
              type="submit"
              disabled={isLoading}
              id="admin-login-submit-btn"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all duration-200 mt-2"
            >
              {isLoading ? (
                <span>Authenticating Admin Token...</span>
              ) : (
                <>
                  <span>Unlock Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Customer Return Link */}
          <div className="mt-6 pt-6 border-t border-stone-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Customer Sign In</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
