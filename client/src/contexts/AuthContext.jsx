import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/me');
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setError(error.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      const { status, message, token, data } = response.data;
      
      if (message === 'Account deactivated') {
        return {
          success: false,
          error: 'Your account has been deactivated'
        };
      }

      if (!token || !data?.user) {
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }

      localStorage.setItem('token', token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', userData);
      const { token, data } = response.data;
      
      if (!token || !data?.user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during registration';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const reactivateAccount = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/reactivate', { email, password });
      const { token, data } = response.data;
      
      if (!token || !data?.user) {
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }

      localStorage.setItem('token', token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Account reactivation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reactivate account'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    reactivateAccount,
    fetchUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 