import api from '../services/api';

// Set or clear auth token in axios headers
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user has required role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Check if user has any of the required roles
export const hasAnyRole = (roles) => {
  const user = getCurrentUser();
  return user && roles.includes(user.role);
};

// Redirect if not authenticated
export const requireAuth = (history, redirectTo = '/login') => {
  if (!isAuthenticated()) {
    history.push(redirectTo);
    return false;
  }
  return true;
};

// Redirect if not authorized (by role)
export const requireRole = (role, history, redirectTo = '/') => {
  const user = getCurrentUser();
  if (!user || user.role !== role) {
    history.push(redirectTo);
    return false;
  }
  return true;
};