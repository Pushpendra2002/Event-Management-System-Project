import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './app/store';
import { getMe } from './features/auth/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socketService from './utils/socket';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Routes/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import Notification from './pages/Notifications';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const AppContent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check for token and get user data
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  useEffect(() => {
    // Connect to socket if user is logged in
    if (user) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/forgot-password" element={<h1 className="text-center py-5">Forgot Password Page - Coming Soon</h1>} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/notifications" element={
              <PrivateRoute>
                <Notification />
              </PrivateRoute>
            } />

            {/* Protected Routes */}
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/bookings" element={
              <PrivateRoute>
                <BookingPage />
              </PrivateRoute>
            } />
            <Route path="/create-event" element={
              <PrivateRoute allowedRoles={['organizer', 'admin']}>
                <CreateEventPage />
              </PrivateRoute>
            } />
            <Route path="/events/:id/edit" element={
              <PrivateRoute allowedRoles={['organizer', 'admin']}>
                <CreateEventPage />
              </PrivateRoute>
            } />
            <Route path="/organizer/dashboard" element={
              <PrivateRoute allowedRoles={['organizer']}>
                <DashboardPage />
              </PrivateRoute>
            } />

            <Route path="/admin/dashboard" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </PrivateRoute>
            } />

            
            <Route path="/admin" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </PrivateRoute>
            } />
            
            {/* Fallback Route */}
            <Route path="*" element={<h1 className="text-center py-5">404 - Page Not Found</h1>} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
