import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get role-scoped localStorage keys
  const getStorageKeys = (role) => ({
    token: `token_${role || 'default'}`,
    user: `user_${role || 'default'}`,
  });

  // Clear all role-specific data
  const clearAllRoleData = () => {
    const roles = ['patient', 'doctor', 'admin', 'laboratory', 'pharmacy'];
    roles.forEach(role => {
      const { token: tokenKey, user: userKey } = getStorageKeys(role);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    });
    // Also clear legacy keys for migration
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Check for token in localStorage on mount (try all role keys)
    const roles = ['patient', 'doctor', 'admin', 'laboratory', 'pharmacy'];
    let foundUser = null;
    let foundToken = null;

    // First try legacy keys for backward compatibility
    const legacyToken = localStorage.getItem('token');
    const legacyUser = localStorage.getItem('user');
    if (legacyToken && legacyUser) {
      const parsedUser = JSON.parse(legacyUser);
      foundToken = legacyToken;
      foundUser = parsedUser;
      // Migrate to role-scoped keys
      const { token: tokenKey, user: userKey } = getStorageKeys(parsedUser.role);
      localStorage.setItem(tokenKey, legacyToken);
      localStorage.setItem(userKey, legacyUser);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } else {
      // Try role-scoped keys
      for (const role of roles) {
        const { token: tokenKey, user: userKey } = getStorageKeys(role);
        const storedToken = localStorage.getItem(tokenKey);
        const storedUser = localStorage.getItem(userKey);
        if (storedToken && storedUser) {
          foundToken = storedToken;
          foundUser = JSON.parse(storedUser);
          break;
        }
      }
    }

    if (foundToken && foundUser) {
      setToken(foundToken);
      setUser(foundUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      // Clear any existing session data before new login
      clearAllRoleData();

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Verify the role matches
      if (data.user.role !== role) {
        throw new Error(`Invalid credentials for ${role} role`);
      }

      setToken(data.token);
      setUser(data.user);
      
      // Store in role-scoped localStorage
      const { token: tokenKey, user: userKey } = getStorageKeys(data.user.role);
      localStorage.setItem(tokenKey, data.token);
      localStorage.setItem(userKey, JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData, role, files = null) => {
    try {
      // Clear any existing session data before new registration
      clearAllRoleData();

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      
      // Store in role-scoped localStorage
      const { token: tokenKey, user: userKey } = getStorageKeys(data.user.role);
      localStorage.setItem(tokenKey, data.token);
      localStorage.setItem(userKey, JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear current user's role-specific data
    if (user?.role) {
      const { token: tokenKey, user: userKey } = getStorageKeys(user.role);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    }
    // Clear all role data to prevent any cross-contamination
    clearAllRoleData();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
