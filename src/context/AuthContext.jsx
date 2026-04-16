import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('seller_user')));
  const [token, setToken] = useState(localStorage.getItem('seller_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('login/', { email, password });
      const { access, user: userData } = response.data;
      
      if (userData.role !== 'SELLER') {
        throw new Error('Unauthorized. Only sellers can access this panel.');
      }

      localStorage.setItem('seller_token', access);
      localStorage.setItem('seller_user', JSON.stringify(userData));
      setToken(access);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
