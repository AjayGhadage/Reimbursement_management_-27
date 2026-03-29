// Use the correct port (5173 is Vite default, 3000 is CRA default)
const API_URL = 'http://localhost:5000/api/auth';

// Add this to check if backend is reachable
export const authService = {
  async checkBackend() {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'OPTIONS'
      });
      console.log('Backend is reachable');
      return true;
    } catch (error) {
      console.error('Backend not reachable:', error);
      return false;
    }
  },

  async signup(userData) {
    try {
      console.log('Sending signup request to:', `${API_URL}/signup`);
      console.log('With data:', userData);
      
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Cannot connect to server. Please make sure backend is running on port 5000');
    }
  },

  async login(credentials) {
    try {
      console.log('Sending login request to:', `${API_URL}/login`);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Cannot connect to server. Please make sure backend is running on port 5000');
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
  }
};