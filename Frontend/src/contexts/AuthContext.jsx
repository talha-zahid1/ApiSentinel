import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if tokens are present on mount to re-authenticate
    const accessToken = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('auth_username');
    const storedEmail = localStorage.getItem('auth_email');

    if (accessToken && storedUsername) {
      setUser({
        username: storedUsername,
        email: storedEmail || '',
      });
    }
    setLoading(false);

    // Listen to automatic logout events dispatched by our axios interceptor
    const handleAutoLogout = () => {
      logout();
    };

    window.addEventListener('auth-logout', handleAutoLogout);
    return () => {
      window.removeEventListener('auth-logout', handleAutoLogout);
    };
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/ApiSentinel/api/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('auth_username', username);
      
      setUser({ username, email: '' });
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.detail || Object.values(error.response.data).flat().join(' ') || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/ApiSentinel/register/', {
        username,
        email,
        password,
      });

      const { username: resUsername, email: resEmail, tokens } = response.data;
      const { access, refresh } = tokens;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('auth_username', resUsername);
      localStorage.setItem('auth_email', resEmail);

      setUser({ username: resUsername, email: resEmail });
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response && error.response.data) {
        errorMessage = Object.values(error.response.data).flat().join(' ') || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_username');
    localStorage.removeItem('auth_email');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
