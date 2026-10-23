import React from 'react';
import { Pizza, Heart, Shield, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-glass)',
      background: 'rgba(10, 12, 16, 0.95)',
      marginTop: '5rem',
      padding: '3.5rem 0 2rem 0'
    }}>
      <div className="container">
        <div className="grid-cols-4" style={{ marginBottom: '3rem' }}>
          <div>
            <div className="brand-logo" style={{ marginBottom: '1rem' }}>
              <Pizza size={22} color="var(--accent-orange)" />
              <span>Slice<span className="brand-gradient">Craft</span></span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Artisan handcrafted sourdough pizzas, slow-simmered sauces, and fresh gourmet farm toppings baked at 800°F.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--text-main)' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><Link to="/" style={{ transition: 'var(--transition)' }}>Artisan Menu</Link></li>
              <li><Link to="/custom-builder">Custom Pizza Builder</Link></li>
              <li><Link to="/dashboard">Track Active Orders</Link></li>
              <li><Link to="/admin/login" style={{ color: 'var(--accent-amber)' }}>Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--text-main)' }}>Quality Promise</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--accent-orange)" /> 30-Minute Express Delivery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="var(--accent-amber)" /> 100% Real Fior di Latte Cheese
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="var(--accent-green)" /> Razorpay Encrypted Payments
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--text-main)' }}>Internship Project</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Oasis Infobyte Internship (OIBSIP) Web Development Level 3 Task. Built with Node.js, Express, MongoDB, React, Socket.io, Node-Cron, Nodemailer & Razorpay.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-dim)'
        }}>
          <div>© {new Date().getFullYear()} SliceCraft Pizza. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Crafted with <Heart size={14} color="#ef4444" fill="#ef4444" /> for OIBSIP Level 3
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
