import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
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
      
      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData, role, files = null) => {
    try {
      let body;
      let headers = {};

      // If files are present, use FormData
      if (files) {
        body = new FormData();
        
        // Add all user data fields
        Object.keys(userData).forEach(key => {
          if (userData[key] !== null && userData[key] !== undefined) {
            if (typeof userData[key] === 'object') {
              body.append(key, JSON.stringify(userData[key]));
            } else {
              body.append(key, userData[key]);
            }
          }
        });
        
        // Add role
        body.append('role', role);
        
        // Add files
        if (files.medicalDegree) body.append('medicalDegreeDocument', files.medicalDegree);
        if (files.licenseCertificate) body.append('licenseDocument', files.licenseCertificate);
        if (files.hospitalProof) body.append('hospitalProofDocument', files.hospitalProof);
        if (files.clinicProof) body.append('clinicProofDocument', files.clinicProof);
        if (files.cnic) body.append('idProofDocument', files.cnic);
        if (files.profilePhoto) body.append('profileImage', files.profilePhoto);
        // Lab/Pharmacy files
        if (files.licenseDocument) body.append('licenseDocument', files.licenseDocument);
        if (files.registrationDocument) body.append('registrationDocument', files.registrationDocument);
        if (files.addressProofDocument) body.append('addressProofDocument', files.addressProofDocument);
        if (files.idProofDocument) body.append('idProofDocument', files.idProofDocument);
      } else {
        // No files, use JSON
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ ...userData, role });
      }

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
      
      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
