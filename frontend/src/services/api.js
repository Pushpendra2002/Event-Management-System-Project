import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      const isAuthPage = typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register');

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!isAuthRequest && !isAuthPage && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  updatePassword: (currentPassword, newPassword) => 
    api.put('/auth/updatepassword', { currentPassword, newPassword }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`)
};

// Events API
export const eventAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  uploadEventImage: (id, image) => {
    const formData = new FormData();
    formData.append('image', image);
    return api.post(`/events/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMyEvents: () => api.get('/events/organizer/me'),
  getFeaturedEvents: () => api.get('/events/featured'),
  getEventsByCategory: (category) => api.get(`/events/category/${category}`),
  getPlatformStats: () => api.get('/events/stats')
};

// Bookings API
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updatePaymentStatus: (id, paymentData) => api.put(`/bookings/${id}/payment`, paymentData),
  cancelBooking: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  checkIn: (id) => api.put(`/bookings/${id}/checkin`)
};

// Users API
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateProfilePhoto: (id, photo) => {
    const formData = new FormData();
    formData.append('photo', photo);
    return api.put(`/users/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  updateEventStatus: (id, status) => api.put(`/admin/events/${id}/status`, { status }),
  featureEvent: (id, featured) => api.put(`/admin/events/${id}/feature`, { featured }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAnalytics: (params) => api.get('/admin/analytics', { params })
};

// Notifications API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// Payments API
export const paymentAPI = {
  createPaymentIntent: (amount, currency) => 
    api.post('/payments/create-payment-intent', { amount, currency }),
  createPayPalOrder: (amount, currency) =>
    api.post('/payments/create-paypal-order', { amount, currency })
};

export default api;