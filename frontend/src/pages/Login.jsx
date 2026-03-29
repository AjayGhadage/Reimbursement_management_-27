import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'EMPLOYEE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData);
      const user = res.data.user;
      login(user, res.data.token);
      
      // Role-based redirection
      if (user.role === 'ADMIN') navigate('/admin/rules');
      else if (user.role === 'MANAGER' || user.role === 'FINANCE' || user.role === 'DIRECTOR') navigate('/approvals');
      else navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div 
        className="bg-overlay" 
        style={{ backgroundImage: `url('/images/login_bg.png')` }} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass card" 
        style={{ maxWidth: '440px', width: '90%', padding: '52px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '64px', height: '64px', backgroundColor: 'var(--accent-primary)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'white'
          }}>
            <Wallet size={32} />
          </div>
          <h1 className="heading-accent" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>ExpenseOS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>The future of reimbursement management.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', 
              borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem',
              border: '1px solid rgba(185, 28, 28, 0.1)', fontWeight: '600'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <input name="email" type="email" required placeholder="name@company.com" onChange={handleChange} style={{ paddingLeft: '48px' }} />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input name="password" type="password" required placeholder="••••••••" onChange={handleChange} style={{ paddingLeft: '48px' }} />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ACCESS LEVEL
            </label>
            <select name="role" onChange={handleChange} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white' }}>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
              <option value="FINANCE">Finance</option>
              <option value="DIRECTOR">Director</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '12px', height: '54px', fontSize: '1.05rem' }} disabled={loading}>
            {loading ? 'Securing Session...' : 'Sign In'}
            <ArrowRight size={20} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          New to the enterprise? <Link to="/signup" style={{ color: 'var(--accent-hover)', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
