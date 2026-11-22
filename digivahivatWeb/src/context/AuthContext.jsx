/**
 * src/context/AuthContext.jsx
 * Authentication & Session Management for DigiVahivat Web
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = '@digivahivat_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.token) {
            setToken(parsed.token);
            if (parsed.user && parsed.user._id && parsed.user.role) {
              setUser(parsed.user);
            } else {
              // Self-heal: If user object was incomplete, fetch /residents/me with the valid token
              try {
                const res = await api.get('/residents/me', {
                  headers: { Authorization: `Bearer ${parsed.token}` },
                });
                const restoredUser = res.data?.data || res.data;
                if (restoredUser && restoredUser._id) {
                  setUser(restoredUser);
                  localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ user: restoredUser, token: parsed.token })
                  );
                }
              } catch (profileErr) {
                console.warn('Could not restore profile from token:', profileErr);
                // Clear corrupted token only if 401 Unauthorized
                if (profileErr.response?.status === 401) {
                  localStorage.removeItem(STORAGE_KEY);
                  setUser(null);
                  setToken(null);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse cached auth state:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: userData, token: authToken })
    );
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: userData, token })
    );
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const role = user?.role || '';
  const isSuperAdmin = role === 'SuperAdmin';
  const isAdmin = role === 'Admin';
  const isGuard = role === 'Guard' || role === 'Gaurd';
  const isResident = role === 'Resident' || (!isSuperAdmin && !isAdmin && !isGuard);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role,
        isSuperAdmin,
        isAdmin,
        isGuard,
        isResident,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
