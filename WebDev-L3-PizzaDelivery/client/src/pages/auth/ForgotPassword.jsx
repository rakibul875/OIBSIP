import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  KeyRound,
  ArrowLeft
} from 'lucide-react';

export default function ForgotPassword() {
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Enter email, 2: Reset Password, 3: Success
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await authService.forgotPassword(email);
      if (res.data.success) {
        setStep(2);
        if (res.data.devResetToken) {
          setResetCode(res.data.devResetToken);
        }
        showToast(res.data.message || 'Password reset link dispatched.', 'info');
      } else {
        setErrorMessage(res.data.message || 'Could not process reset request.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Server error initiating password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode) {
      setErrorMessage('Reset token is required. Please check your email.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setErrorMessage('New password must contain at least 1 number.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await authService.resetPassword({
        token: resetCode,
        newPassword,
      });

      if (res.data.success) {
        setStep(3);
        showToast(res.data.message || 'Password successfully updated!', 'success');
      } else {
        setErrorMessage(res.data.message || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred while resetting password.');
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
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
            Reset Password
          </h1>
          <p className="text-sm text-stone-400 mt-2">
            Recover your SliceCraft account access in minutes.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-2xl relative overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aryan@example.com"
                    required
                    className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-stone-950 font-bold text-sm shadow-lg shadow-orange-600/30 transition-all duration-200 mt-2"
              >
                {isLoading ? (
                  <span>Generating Reset Link...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-crust">
              <div className="p-3 rounded-2xl bg-orange-950/20 border border-orange-500/30 text-xs text-orange-200">
                <p className="font-semibold text-orange-400">Simulation Token Generated:</p>
                <p className="font-mono mt-1 text-stone-300">Code: <span className="text-white font-bold">{resetCode}</span></p>
                <p className="mt-1 text-stone-400">In production, this link is dispatched through `nodemailer` via SMTP.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                  New Password (min 8 chars, 1 number)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-500" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-stone-950 font-bold text-sm shadow-lg shadow-orange-600/30 transition-all"
              >
                {isLoading ? 'Updating Password...' : 'Set New Password & Sign In'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4 animate-crust">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Password Updated!</h3>
              <p className="text-sm text-stone-400">
                Your credentials have been securely updated. You can now sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-orange-600/30"
              >
                Proceed to Sign In
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-stone-800/80 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
