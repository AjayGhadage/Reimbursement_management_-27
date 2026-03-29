import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building, Lock, Mail, Globe, UserPlus, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', companyName: '', country: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/signup', formData);
      navigate('/login', { state: { message: 'Signup successful! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      <div 
        className="bg-overlay" 
        style={{ backgroundImage: `url('/C:/Users/AJAY%20GHADAGE/.gemini/antigravity/brain/9fd6b6fa-a4b8-4e50-845d-058f60b84a75/bg_login_reg_1774783495753.png')` }} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass card" 
        style={{ maxWidth: '500px', width: '100%', padding: '52px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '56px', height: '56px', backgroundColor: 'var(--accent-primary)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'white'
          }}>
            <UserPlus size={28} />
          </div>
          <h1 className="heading-accent" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Join ExpenseOS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Setting up your enterprise workspace.</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>FULL NAME</label>
              <input name="name" type="text" required placeholder="John Doe" onChange={handleChange} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <input name="email" type="email" required placeholder="john@company.com" onChange={handleChange} style={{ paddingLeft: '48px' }} />
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input name="password" type="password" required placeholder="••••••••" onChange={handleChange} style={{ paddingLeft: '48px' }} />
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: '500' }}>
              <strong>Workspace Admin:</strong> If you are creating a new company, enter details below.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>COMPANY NAME</label>
                <div style={{ position: 'relative' }}>
                  <input name="companyName" type="text" placeholder="Acme Global Inc." onChange={handleChange} style={{ paddingLeft: '48px' }} />
                  <Building size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>BASE COUNTRY</label>
                <div style={{ position: 'relative' }}>
                  <input name="country" type="text" placeholder="e.g. United States, India" onChange={handleChange} style={{ paddingLeft: '48px' }} />
                  <Globe size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '12px', height: '54px' }} disabled={loading}>
            {loading ? 'Provisioning...' : 'Initialize Workspace'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already part of a team? <Link to="/login" style={{ color: 'var(--accent-hover)', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
