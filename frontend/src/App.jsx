import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import { authService } from './services/auth.service';
import './styles/auth.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    
    if (token && currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleSignupSuccess = (userData) => {
    setIsLogin(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Role-based dashboard component
  const RoleBasedDashboard = ({ user, onLogout }) => {
    const getRoleIcon = () => {
      switch(user?.role) {
        case 'ADMIN':
          return '⚙️';
        case 'MANAGER':
          return '📊';
        default:
          return '👤';
      }
    };

    const getRoleBasedContent = () => {
      switch(user?.role) {
        case 'ADMIN':
          return (
            <div>
              <h3>Admin Controls</h3>
              <ul>
                <li>📋 View All Expenses</li>
                <li>👥 Manage Users</li>
                <li>⚙️ System Settings</li>
                <li>📊 Analytics Dashboard</li>
                <li>🔧 Configure Approval Rules</li>
              </ul>
            </div>
          );
        case 'MANAGER':
          return (
            <div>
              <h3>Manager Controls</h3>
              <ul>
                <li>✅ Approve/Reject Expenses</li>
                <li>👥 View Team Expenses</li>
                <li>📈 Team Reports</li>
                <li>📝 Review Pending Requests</li>
              </ul>
            </div>
          );
        default:
          return (
            <div>
              <h3>Employee Controls</h3>
              <ul>
                <li>💰 Submit New Expense</li>
                <li>📋 View My Expenses</li>
                <li>📊 My Expense Reports</li>
                <li>🔔 Track Approvals</li>
              </ul>
            </div>
          );
      }
    };

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Header */}
        <header style={{
          background: 'var(--accent)',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              💰 Reimbursement System
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{user?.name}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {getRoleIcon()} {user?.role}
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--code-bg)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: 'var(--text-h)', marginBottom: '0.5rem' }}>
              Welcome back, {user?.name}! 👋
            </h2>
            <p style={{ color: 'var(--text)' }}>
              You are logged in as <strong>{user?.role}</strong>. 
              {user?.role === 'ADMIN' && ' You have full system access.'}
              {user?.role === 'MANAGER' && ' You can approve/reject expenses for your team.'}
              {user?.role === 'EMPLOYEE' && ' You can submit and track your expenses.'}
            </p>
          </div>

          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            padding: '2rem'
          }}>
            {getRoleBasedContent()}
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <h3>Total Expenses</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>$0</p>
            </div>
            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <h3>Pending Approvals</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>0</p>
            </div>
            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <h3>Approved</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>0</p>
            </div>
          </div>
        </main>
      </div>
    );
  };

  if (isAuthenticated) {
    return <RoleBasedDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <>
      {isLogin ? (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setIsLogin(false)}
        />
      ) : (
        <Signup 
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </>
  );
}

export default App;