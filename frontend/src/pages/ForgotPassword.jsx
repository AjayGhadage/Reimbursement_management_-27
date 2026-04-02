import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div 
        className="bg-overlay" 
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass card" 
        style={{ maxWidth: '440px', width: '90%', padding: '48px' }}
      >
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '32px', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="heading-accent" style={{ fontSize: '2rem', marginBottom: '12px' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Enter your email and we'll send you a recovery token.</p>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600' }}>
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  required 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '48px' }} 
                />
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ height: '54px' }} disabled={loading}>
              {loading ? 'Processing...' : 'Send Recovery Token'}
              <Send size={18} />
            </button>
          </form>
        )}
        
        {message && (
             <Link to="/reset-password" style={{ display: 'block', textAlign: 'center', marginTop: '24px', color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}>
                Proceed to Reset Page →
             </Link>
        )}
      </motion.div>
    </div>
  );
}
