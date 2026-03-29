import { useState, useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart3, PlusCircle, LayoutDashboard, Settings, 
  Users, LogOut, Menu, X, Bell, Wallet, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from './Chatbot';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} /> },
    { name: 'Request', path: '/submit', icon: <PlusCircle size={22} /> },
    { name: 'Approvals', path: '/approvals', icon: <BarChart3 size={22} /> },
    { name: 'Rules', path: '/admin/rules', icon: <Settings size={22} />, role: 'ADMIN' },
    { name: 'Users', path: '/admin/users', icon: <Users size={22} />, role: 'ADMIN' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar - Desktop */}
      <aside 
        style={{ 
          width: isSidebarOpen ? '280px' : '88px',
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          position: 'relative'
        }}
        className="hide-mobile"
      >
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            minWidth: '40px', width: '40px', height: '40px', borderRadius: '10px', 
            background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Wallet size={22} />
          </div>
          {isSidebarOpen && <span style={{ fontWeight: '800', fontSize: '1.4rem', letterSpacing: '-0.02em' }}>ExpenseOS</span>}
        </div>

        <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            if (item.role && user?.role !== item.role) return null;
            const active = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{ 
                  textDecoration: 'none',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '14px 16px',
                  borderRadius: '12px',
                  color: active ? 'white' : 'var(--text-muted)',
                  background: active ? 'var(--text-main)' : 'transparent',
                  fontWeight: '600',
                  transition: '0.2s',
                  boxShadow: active ? 'var(--shadow-lg)' : 'none'
                }}
              >
                {item.icon}
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', padding: '12px', background: 'transparent', color: '#ef4444', 
              display: 'flex', alignItems: 'center', gap: '16px', fontWeight: '600'
            }}
          >
            <LogOut size={22} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Mobile Header */}
        <header className="show-mobile" style={{ 
          background: 'var(--card-bg)', backdropFilter: 'blur(10px)', 
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', borderRadius: 'var(--radius)', zIndex: 60
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={24} color="var(--accent-primary)" />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>ExpenseOS</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        {/* Global Action Bar / User Info */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', marginBottom: '32px' }} className="hide-mobile">
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <Bell size={18} />
            </div>
          </div>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 20px 6px 6px', borderRadius: '100px' }}>
             <div style={{ width: '36px', height: '36px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
               <User size={18} />
             </div>
             <div>
               <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{user?.name}</div>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</div>
             </div>
          </div>
        </div>

        <Outlet />
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '80%', background: 'white', padding: '40px 24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.4rem' }}>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><X size={32} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {menuItems.map((item) => (
                   <Link 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '600' }}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
                <button onClick={handleLogout} style={{ marginTop: '20px', color: '#ef4444', display: 'flex', gap: '16px', padding: '16px', fontWeight: '600' }}>
                  <LogOut size={22} /> Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
}
