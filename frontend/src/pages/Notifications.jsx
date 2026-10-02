import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../features/notifications/notificationSlice';
import {
  Container,
  Card,
  Button,
  Badge,
  Tab,
  Nav,
  Spinner
} from 'react-bootstrap';
import {
  Bell,
  Ticket,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trash2,
  Check,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import moment from 'moment';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading, unreadCount } = useSelector(state => state.notifications);
  const [filterTab, setFilterTab] = useState('all');

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const filteredNotifications = useMemo(() => {
    if (filterTab === 'unread') {
      return notifications.filter(n => !n.read);
    }
    if (filterTab === 'read') {
      return notifications.filter(n => n.read);
    }
    return notifications;
  }, [notifications, filterTab]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
      case 'payment_success':
        return <CheckCircle size={20} className="text-success" />;
      case 'booking_cancelled':
      case 'event_cancelled':
      case 'payment_failed':
        return <AlertCircle size={20} className="text-danger" />;
      case 'event_created':
      case 'event_updated':
        return <Calendar size={20} className="text-primary" />;
      default:
        return <Bell size={20} className="text-warning" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger" className="small">High</Badge>;
      case 'medium':
        return <Badge bg="warning" text="dark" className="small">Medium</Badge>;
      default:
        return <Badge bg="light" text="muted" className="small border">Standard</Badge>;
    }
  };

  return (
    <Container className="py-4 py-lg-5" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Bell size={26} className="text-primary" />
            Notifications Center
          </h2>
          <p className="text-muted small mb-0">
            Stay informed with ticket updates, booking confirmations, and event reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => dispatch(markAllAsRead())}
            className="d-flex align-items-center shadow-sm"
          >
            <Check size={16} className="me-1" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tab.Container activeKey={filterTab} onSelect={(k) => setFilterTab(k)}>
        <Nav variant="pills" className="mb-4 bg-light p-1 rounded-3 d-inline-flex">
          <Nav.Item>
            <Nav.Link eventKey="all" className="small fw-semibold py-1 px-3">
              All ({notifications.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="unread" className="small fw-semibold py-1 px-3">
              Unread ({unreadCount})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="read" className="small fw-semibold py-1 px-3">
              Read ({notifications.length - unreadCount})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Loading State */}
        {loading && notifications.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted small">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                <CheckCircle size={40} className="text-success opacity-75" />
              </div>
              <h5 className="fw-bold mb-1">You're All Caught Up!</h5>
              <p className="text-muted small mb-3">
                {filterTab === 'unread'
                  ? 'No unread notifications at the moment.'
                  : 'No notification records found in your account.'}
              </p>
              <Button as={Link} to="/events" variant="primary" size="sm">
                Explore Live Events <ArrowRight size={14} className="ms-1" />
              </Button>
            </Card.Body>
          </Card>
        ) : (
          /* Notification Cards List */
          <div className="d-flex flex-column gap-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification._id}
                className={`border-0 shadow-sm transition ${
                  !notification.read ? 'border-start border-4 border-primary bg-white' : 'bg-light bg-opacity-50'
                }`}
                style={{ transition: 'all 0.2s ease' }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-start gap-3">
                    {/* Icon */}
                    <div className="p-2 rounded-circle bg-light d-flex align-items-center justify-content-center mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-grow-1">
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-1 mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <strong className={`small ${!notification.read ? 'text-dark' : 'text-muted'}`}>
                            {notification.title}
                          </strong>
                          {!notification.read && (
                            <Badge bg="primary" pill style={{ fontSize: '0.65rem' }}>
                              New
                            </Badge>
                          )}
                          {notification.priority && getPriorityBadge(notification.priority)}
                        </div>

                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {moment(notification.createdAt).fromNow()}
                        </small>
                      </div>

                      <p className="text-muted small mb-2">{notification.message}</p>

                      {/* Action Links */}
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top border-light">
                        <div className="d-flex gap-3">
                          {notification.data?.bookingId && (
                            <Link
                              to="/bookings"
                              className="text-decoration-none small fw-semibold text-primary d-flex align-items-center"
                            >
                              <Ticket size={13} className="me-1" /> View Digital Pass
                            </Link>
                          )}
                          {notification.data?.eventId && (
                            <Link
                              to={`/events/${notification.data.eventId}`}
                              className="text-decoration-none small fw-semibold text-primary d-flex align-items-center"
                            >
                              <ExternalLink size={13} className="me-1" /> Event Details
                            </Link>
                          )}
                        </div>

                        <div className="d-flex gap-2 ms-auto">
                          {!notification.read && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => dispatch(markAsRead(notification._id))}
                              title="Mark as read"
                            >
                              <Check size={12} className="me-1" /> Mark Read
                            </Button>
                          )}

                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="py-0 px-2"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => dispatch(deleteNotification(notification._id))}
                            title="Delete notification"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Tab.Container>
    </Container>
  );
};

export default Notifications;
