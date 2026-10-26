import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Send,
  ArrowRight
} from 'lucide-react';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    verificationCode: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const passwordsMatch = formData.password.length > 0 && formData.password === formData.confirmPassword;
  const isPasswordValid = hasMinLength && hasNumber && passwordsMatch;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address first.');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name first.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Please ensure your password meets all requirements before requesting verification.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      if (res.success) {
        setIsCodeSent(true);
        if (res.devVerificationToken) {
          setFormData((prev) => ({ ...prev, verificationCode: res.devVerificationToken }));
        }
      } else {
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode.trim()) {
      setErrorMessage('Please enter the verification token received in your email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await authService.verifyEmail(formData.verificationCode.trim());
      if (res.data.success) {
        setIsEmailVerified(true);
        setErrorMessage('');
      } else {
        setErrorMessage(res.data.message || 'Verification token invalid.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to verify token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password does not meet validation criteria.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // If not yet registered, register now
      if (!isCodeSent) {
        const res = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });

        if (res.success) {
          setIsCodeSent(true);
          if (res.devVerificationToken) {
            setFormData((prev) => ({ ...prev, verificationCode: res.devVerificationToken }));
            // Auto verify dev token for seamless experience
            await authService.verifyEmail(res.devVerificationToken);
            setIsEmailVerified(true);
            navigate('/login');
          }
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      } else if (isEmailVerified) {
        navigate('/login');
      } else {
        setErrorMessage('Please verify your email using the verification code dispatched.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-xl shadow-orange-600/30 mb-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
            Join Slice<span className="text-orange-500">Craft</span>
          </h1>
          <p className="text-sm text-stone-400 mt-2">
            Create an account to order wood-fired pizzas and track live deliveries.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Glow backdrop */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Patel"
                  required
                  className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Email with Verification Flow */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Email Address
                </label>
                {isEmailVerified ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-stone-500">Verification Required</span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isEmailVerified}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-60 transition-all"
                  />
                </div>
                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isCodeSent ? 'Resend' : 'Send Code'}
                  </button>
                )}
              </div>
            </div>

            {/* Verification Code Input (Shown once code is sent and not yet verified) */}
            {isCodeSent && !isEmailVerified && (
              <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-2 animate-crust">
                <div className="flex items-center justify-between text-xs text-orange-300">
                  <span>Enter 6-digit OTP sent to your email:</span>
                  <span className="text-stone-400">(Auto-simulated: 849201)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    maxLength={6}
                    placeholder="849201"
                    className="w-full bg-stone-900 border border-orange-500/40 rounded-xl px-4 py-2.5 text-center font-mono font-bold tracking-widest text-lg text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-stone-950 font-bold text-xs uppercase tracking-wider shrink-0 transition-all"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                Mobile Number (For Delivery SMS)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                Create Password
              </label>
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

            {/* Confirm Password (Duplicate Check) */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                Confirm Password (Duplicate Check)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`w-full bg-stone-900/90 border rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-stone-500 focus:outline-none transition-all ${
                    formData.confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-emerald-500/60 focus:border-emerald-500'
                        : 'border-rose-500/60 focus:border-rose-500'
                      : 'border-stone-800 focus:border-orange-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-500 hover:text-stone-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Real-time Password Validation Checklist */}
            <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800/80 space-y-2 text-xs">
              <p className="font-semibold text-stone-400 uppercase tracking-wider text-[10px]">
                Password Validation Rules:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-stone-500'}`}>
                  {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Min 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-stone-500'}`}>
                  {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-stone-500'}`}>
                  {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !isEmailVerified}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-stone-950 font-bold text-sm shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account & Verify</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-6 border-t border-stone-800/80 text-center text-xs text-stone-400">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4">
              Sign In here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
