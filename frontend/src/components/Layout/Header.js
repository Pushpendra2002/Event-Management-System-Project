import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead
} from '../../features/notifications/notificationSlice';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import {
  Bell,
  Calendar,
  User,
  LogOut,
  Ticket,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  Plus
} from 'lucide-react';
import moment from 'moment';

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  // Notification Icon Helper
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
      case 'payment_success':
        return <CheckCircle size={15} className="text-success" />;
      case 'booking_cancelled':
      case 'event_cancelled':
      case 'payment_failed':
        return <AlertCircle size={15} className="text-danger" />;
      case 'event_created':
      case 'event_updated':
        return <Calendar size={15} className="text-primary" />;
      default:
        return <Bell size={15} className="text-warning" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }
    if (notification.data?.bookingId) {
      navigate('/bookings');
    } else if (notification.data?.eventId) {
      navigate(`/events/${notification.data.eventId}`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="py-2 shadow-sm border-bottom border-secondary border-opacity-25">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold fs-4 text-white">
          <div className="bg-primary rounded-circle p-1 d-inline-flex me-2 shadow-sm">
            <Sparkles size={18} className="text-white" />
          </div>
          <span>Event<span className="text-primary">Pulse</span></span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          {/* Main Navigation Links */}
          <Nav className="me-auto ms-lg-3">
            <Nav.Link as={Link} to="/events" className="fw-medium">
              Explore Events
            </Nav.Link>
            <Nav.Link as={Link} to="/categories" className="fw-medium">
              Categories
            </Nav.Link>
            {user?.role === 'organizer' && (
              <Nav.Link as={Link} to="/organizer/dashboard" className="fw-medium text-info">
                Organizer Studio
              </Nav.Link>
            )}
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin" className="fw-medium text-warning d-flex align-items-center">
                <Shield size={14} className="me-1" /> Admin Center
              </Nav.Link>
            )}
          </Nav>

          {/* Right Navigation / User Center */}
          <Nav className="align-items-center gap-2 mt-2 mt-lg-0">
            {user ? (
              <>
                {/* Host Event Button (if organizer or admin) */}
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Nav.Link
                    as={Link}
                    to="/create-event"
                    className="btn btn-outline-light btn-sm text-white px-3 py-1 d-none d-md-inline-flex align-items-center rounded-pill"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Plus size={14} className="me-1" /> Create Event
                  </Nav.Link>
                )}

                {/* My Bookings link */}
                <Nav.Link
                  as={Link}
                  to="/bookings"
                  className="d-flex align-items-center fw-medium text-light"
                >
                  <Ticket size={16} className="me-1 text-primary" />
                  <span>My Passes</span>
                </Nav.Link>

                {/* Notification Center Dropdown */}
                <NavDropdown
                  title={
                    <div className="position-relative d-inline-flex align-items-center p-1 cursor-pointer">
                      <Bell size={18} className="text-light" />
                      {unreadCount > 0 && (
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: '0.65rem', padding: '0.25em 0.45em' }}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  }
                  align="end"
                  id="notifications-dropdown"
                  className="notification-dropdown"
                >
                  {/* Dropdown Header */}
                  <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center" style={{ minWidth: '320px' }}>
                    <div className="d-flex align-items-center gap-2">
                      <strong className="text-dark small">Notifications</strong>
                      {unreadCount > 0 && (
                        <Badge bg="primary" pill style={{ fontSize: '0.7rem' }}>
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary text-decoration-none small"
                        style={{ fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(markAllAsRead());
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification Items */}
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted small">
                        <Bell size={24} className="opacity-25 mb-1" />
                        <p className="mb-0">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <NavDropdown.Item
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-3 py-2 border-bottom border-light ${!notification.read ? 'bg-light bg-opacity-75' : ''}`}
                        >
                          <div className="d-flex align-items-start gap-2">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex justify-content-between align-items-baseline">
                                <span className={`small text-truncate ${!notification.read ? 'fw-bold text-dark' : 'text-muted'}`} style={{ maxWidth: '180px' }}>
                                  {notification.title}
                                </span>
                                <small className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>
                                  {moment(notification.createdAt).fromNow(true)}
                                </small>
                              </div>
                              <p className="text-muted small mb-0 text-truncate" style={{ fontSize: '0.78rem', maxWidth: '240px' }}>
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </NavDropdown.Item>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2 text-center bg-light border-top">
                    <Link
                      to="/notifications"
                      className="text-decoration-none small fw-semibold text-primary d-block"
                      style={{ fontSize: '0.8rem' }}
                    >
                      View all notifications →
                    </Link>
                  </div>
                </NavDropdown>

                {/* User Profile Menu */}
                <NavDropdown
                  title={
                    <div className="d-inline-flex align-items-center gap-2 cursor-pointer">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                        style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                      </div>
                      <span className="d-none d-md-inline text-light fw-medium small">
                        {user.name?.split(' ')[0]}
                      </span>
                    </div>
                  }
                  align="end"
                  id="user-profile-dropdown"
                >
                  <div className="px-3 py-2 border-bottom">
                    <strong className="d-block text-dark small">{user.name}</strong>
                    <span className="text-muted small d-block text-truncate" style={{ maxWidth: '180px', fontSize: '0.75rem' }}>
                      {user.email}
                    </span>
                    <Badge
                      bg={user.role === 'admin' ? 'danger' : user.role === 'organizer' ? 'primary' : 'success'}
                      className="mt-1 text-capitalize"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {user.role}
                    </Badge>
                  </div>

                  <NavDropdown.Item as={Link} to="/profile" className="small py-2">
                    <User size={14} className="me-2 text-muted" /> Profile & Settings
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/bookings" className="small py-2">
                    <Ticket size={14} className="me-2 text-muted" /> My Passes
                  </NavDropdown.Item>

                  {user.role === 'organizer' && (
                    <NavDropdown.Item as={Link} to="/organizer/dashboard" className="small py-2">
                      <Calendar size={14} className="me-2 text-primary" /> Organizer Studio
                    </NavDropdown.Item>
                  )}

                  {user.role === 'admin' && (
                    <NavDropdown.Item as={Link} to="/admin" className="small py-2">
                      <Shield size={14} className="me-2 text-danger" /> Admin Dashboard
                    </NavDropdown.Item>
                  )}

                  <NavDropdown.Divider className="my-1" />

                  <NavDropdown.Item onClick={handleLogout} className="small text-danger py-2">
                    <LogOut size={14} className="me-2" /> Sign Out
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Nav.Link as={Link} to="/login" className="btn btn-outline-light btn-sm text-white px-3 py-1 rounded-pill">
                  Sign In
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn btn-primary btn-sm text-white px-3 py-1 rounded-pill shadow-sm">
                  Register
                </Nav.Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
