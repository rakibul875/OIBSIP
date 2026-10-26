import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Award, ShieldCheck, Heart, Sparkles, ChefHat } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const promises = [
    {
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      title: "450°C Wood-Fired",
      desc: "Authentic refractory stone ovens delivering leopard-spotted crusts."
    },
    {
      icon: <Award className="w-5 h-5 text-amber-400" />,
      title: "San Marzano D.O.P.",
      desc: "Slow-simmered volcanic plum tomatoes with zero artificial preservatives."
    },
    {
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      title: "30-Min Fresh Delivery",
      desc: "Thermal insulated lockboxes guarantee piping hot pizza at your doorstep."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      title: "Razorpay Test Sandbox",
      desc: "Simulated secure 256-bit encrypted checkout with instant receipt."
    }
  ];

  return (
    <footer className="w-full bg-stone-950 border-t border-stone-800/80 pt-16 pb-12 mt-20 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Quality Promises Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-stone-800/60">
          {promises.map((p, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl glass-panel border border-stone-800/50 hover:border-orange-500/20 transition-all">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 shrink-0">
                {p.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-display">{p.title}</h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white font-display">
                Slice<span className="text-orange-500">Craft</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Crafting authentic artisan pizzas with slow-fermented sourdough, hand-stretched mozzarella, and farm-picked toppings. Designed with love for modern food lovers.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800">
                <ChefHat className="w-3.5 h-3.5 text-orange-400" />
                Master Chef Approved
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pure Ingredients
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400 font-display">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">Artisan Preset Menu</Link>
              </li>
              <li>
                <Link to="/custom-pizza" className="hover:text-orange-400 transition-colors">4-Step Custom Studio</Link>
              </li>
              <li>
                <Link to="/order-summary" className="hover:text-orange-400 transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/order-tracking" className="hover:text-orange-400 transition-colors">Real-Time Tracker</Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400 font-display">Customer</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-orange-400 transition-colors">Sign In / Account</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-orange-400 transition-colors">Create Account</Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-orange-400 transition-colors">Reset Password</Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-purple-400 hover:text-purple-300 transition-colors">Kitchen Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Technical Specs & Project Badge */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400 font-display">Architecture</h4>
            <div className="space-y-1.5 text-xs text-stone-400">
              <p><strong className="text-stone-200">Client:</strong> React 19 + Tailwind CSS</p>
              <p><strong className="text-stone-200">Server:</strong> Node.js, Express, Socket.io</p>
              <p><strong className="text-stone-200">Database:</strong> MongoDB & Mongoose</p>
              <p><strong className="text-stone-200">Payments:</strong> Razorpay Sandbox</p>
              <p><strong className="text-stone-200">Sentinel:</strong> Node-Cron & Nodemailer</p>
            </div>
          </div>
        </div>

        {/* Copyright & OIBSIP Credits */}
        <div className="pt-8 mt-8 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="text-center sm:text-left">
            <p className="text-stone-400 font-medium">
              © {currentYear} SliceCraft Pizza Studio. All rights reserved.
            </p>
            <p className="mt-1 text-stone-500">
              Developed for <span className="text-orange-400 font-semibold">Oasis Infobyte Internship (OIBSIP)</span> — Web Development & Designing — Level 3 Task.
            </p>
          </div>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Built with passion &</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by OIBSIP Intern</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
