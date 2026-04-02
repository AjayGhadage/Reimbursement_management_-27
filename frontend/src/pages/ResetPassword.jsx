import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [formData, setFormData] = useState({ token: '', password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (formData.password !== formData.confirm) {
        return setError("Passwords do not match");
    }
    
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', { 
        token: formData.token, 
        password: formData.password 
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div 
        className="bg-overlay" 
        style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' }} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass card" 
        style={{ maxWidth: '440px', width: '90%', padding: '48px' }}
      >
        <Link to="/forgot-password" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '32px', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Previous Step
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="heading-accent" style={{ fontSize: '2rem', marginBottom: '12px' }}>Update Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Secure your account with a fresh credential.</p>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', marginBottom: '24px', fontSize: '0.95rem', fontWeight: '700', textAlign: 'center' }}>
            <CheckCircle size={24} style={{ display: 'block', margin: '0 auto 8px' }} />
            {message} 
            <p style={{ fontSize: '0.8rem', fontWeight: '400', marginTop: '4px' }}>Redirecting to login...</p>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                RECOVERY TOKEN
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  required 
                  placeholder="Paste token from logs" 
                  value={formData.token}
                  onChange={(e) => setFormData({...formData, token: e.target.value})}
                  style={{ paddingLeft: '48px' }} 
                />
                <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                NEW PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{ paddingLeft: '48px' }} 
                />
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                CONFIRM PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={formData.confirm}
                  onChange={(e) => setFormData({...formData, confirm: e.target.value})}
                  style={{ paddingLeft: '48px' }} 
                />
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ height: '54px', marginTop: '12px' }} disabled={loading}>
              {loading ? 'Changing...' : 'Update Password'}
              <CheckCircle size={18} />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
