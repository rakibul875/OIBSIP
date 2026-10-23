import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@slicecraft.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Admin authentication failed. Restricted portal.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
          }}>
            <ShieldAlert size={30} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Kitchen Admin Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Restricted staff access for inventory & order dispatch
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="admin@slicecraft.com"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Master Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
            }}
          >
            {loading ? 'Verifying Credentials...' : <>Access Admin Sentinel <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{
          marginTop: '1.8rem',
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-glass)',
          fontSize: '0.82rem',
          color: 'var(--text-dim)'
        }}>
          <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '2px' }}>
            Default Pre-Seeded Credentials:
          </strong>
          Email: <code style={{ color: 'var(--text-muted)' }}>admin@slicecraft.com</code> <br />
          Password: <code style={{ color: 'var(--text-muted)' }}>Admin@12345</code>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
