const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
  async signup(userData) {
    try {
      console.log('Sending signup request');
      
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Don't expose specific errors
        throw new Error(data.message || 'Registration failed. Please try again.');
      }
      
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Unable to create account. Please check your information and try again.');
    }
  },

  async login(credentials) {
    try {
      console.log('Sending login request');
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Generic error message for all failures
        throw new Error('Invalid email, password, or role. Please check your credentials.');
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email, password, or role. Please check your credentials.');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || 'EMPLOYEE';
  },

  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  }
};