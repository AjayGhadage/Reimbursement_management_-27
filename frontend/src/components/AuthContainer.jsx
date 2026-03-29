// components/AuthContainer.jsx
import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const AuthContainer = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = (user) => {
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
  };

  const handleSignupSuccess = (user) => {
    // After signup, you might want to automatically log them in
    // or redirect to login page
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
  };

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
};

export default AuthContainer;