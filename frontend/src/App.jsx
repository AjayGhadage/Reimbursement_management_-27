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
    console.log('App mounted');
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    
    if (token && currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log('Login success:', userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleSignupSuccess = (userData) => {
    console.log('Signup success:', userData);
    setIsLogin(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Simple test to see if component renders
  console.log('Rendering App, isAuthenticated:', isAuthenticated);

  if (isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Welcome, {user?.name}!</h1>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role || 'EMPLOYEE'}</p>
        <button 
          onClick={handleLogout} 
          style={{
            background: '#aa3bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    );
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