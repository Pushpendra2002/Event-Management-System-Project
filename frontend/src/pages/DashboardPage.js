import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyEvents, deleteEvent } from '../features/events/eventSlice';
import { fetchBookings } from '../features/bookings/bookingSlice';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Modal,
  InputGroup,
  Form,
  Tab,
  Tabs,
  ProgressBar
} from 'react-bootstrap';
import {
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Receipt,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  XCircle
} from 'lucide-react';
import moment from 'moment';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { myEvents } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [backendStats, setBackendStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search for Organizer's Events
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    eventId: null,
    eventTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionAlert, setActionAlert] = useState(null);

  // Derive stats smoothly via useMemo - avoids any state loops
  const stats = useMemo(() => {
    if (backendStats) {
      return backendStats;
    }
    const totalEvents = myEvents?.length || 0;
    const upcomingEvents = (myEvents || []).filter(event =>
      new Date(event.startDate) > new Date() && event.status === 'published'
    ).length;
    const totalAttendees = (myEvents || []).reduce((sum, event) => sum + (event.currentAttendees || 0), 0);
    const totalRevenue = (myEvents || []).reduce((sum, event) => {
      const eventRevenue = event.ticketTypes?.reduce((ticketSum, ticket) =>
        ticketSum + (ticket.price * (ticket.sold || 0)), 0
      ) || 0;
      return sum + eventRevenue;
    }, 0);

    return {
      totalEvents,
      totalAttendees,
      totalRevenue,
      upcomingEvents
    };
  }, [backendStats, myEvents]);

  // Load organizer data once on component mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        await Promise.allSettled([
          dispatch(fetchMyEvents()),
          dispatch(fetchBookings())
        ]);

        try {
          const response = await api.get('/dashboard/stats');
          if (isMounted && response.data?.data) {
            if (response.data.data.stats) {
              setBackendStats(response.data.data.stats);
            }
            if (response.data.data.recentBookings) {
              setRecentSales(response.data.data.recentBookings);
            }
          }
        } catch (apiErr) {
          console.warn('Dashboard stats API error, will compute locally:', apiErr);
        }
      } catch (err) {
        if (isMounted) setError('Failed to load dashboard data');
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const refreshDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data?.data) {
        if (response.data.data.stats) {
          setBackendStats(response.data.data.stats);
        }
        if (response.data.data.recentBookings) {
          setRecentSales(response.data.data.recentBookings);
        }
      }
    } catch {
      // stats automatically falls back to local myEvents computation
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return myEvents.filter(event => {
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesSearch = searchQuery.trim() === '' ||
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [myEvents, statusFilter, searchQuery]);

  // Status counts for tabs
  const counts = useMemo(() => {
    return {
      all: myEvents.length,
      published: myEvents.filter(e => e.status === 'published').length,
      draft: myEvents.filter(e => e.status === 'draft').length,
      cancelled: myEvents.filter(e => e.status === 'cancelled').length
    };
  }, [myEvents]);

  // Delete Handler
  const openDeleteModal = (event) => {
    setDeleteModal({
      show: true,
      eventId: event._id,
      eventTitle: event.title
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      show: false,
      eventId: null,
      eventTitle: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.eventId) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteEvent(deleteModal.eventId)).unwrap();
      setActionAlert({
        type: 'success',
        message: `Event "${deleteModal.eventTitle}" was deleted successfully.`
      });
      refreshDashboardStats();
    } catch (err) {
      setActionAlert({
        type: 'danger',
        message: typeof err === 'string' ? err : 'Failed to delete event.'
      });
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge bg="success" className="px-2 py-1"><CheckCircle size={12} className="me-1" />Published</Badge>;
      case 'draft':
        return <Badge bg="warning" text="dark" className="px-2 py-1"><Clock size={12} className="me-1" />Draft</Badge>;
      case 'cancelled':
        return <Badge bg="danger" className="px-2 py-1"><XCircle size={12} className="me-1" />Cancelled</Badge>;
      default:
        return <Badge bg="secondary" className="px-2 py-1">{status}</Badge>;
    }
  };

  if (initialLoading && myEvents.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading your organizer dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4 py-lg-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
        <div>
          <h1 className="fw-bold mb-1">Organizer Dashboard</h1>
          <p className="text-muted mb-0">
            Welcome back, <span className="fw-semibold text-dark">{user?.name}</span>! Track event performance and ticket sales.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <Button as={Link} to="/create-event" variant="primary" className="d-flex align-items-center shadow-sm">
            <Plus size={18} className="me-1" /> Create New Event
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionAlert && (
        <Alert
          variant={actionAlert.type}
          dismissible
          onClose={() => setActionAlert(null)}
          className="mb-4 shadow-sm"
        >
          {actionAlert.message}
        </Alert>
      )}

      {error && (
        <Alert variant="warning" className="mb-4 shadow-sm">
          <AlertCircle className="me-2" size={18} />
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col lg={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                <Calendar size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{stats.totalEvents}</h4>
                <span className="text-muted small">Total Events</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 me-3">
                <Users size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{stats.totalAttendees}</h4>
                <span className="text-muted small">Total Attendees</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 me-3">
                <IndianRupee size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{formatCurrency(stats.totalRevenue)}</h4>
                <span className="text-muted small">Total Revenue</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{stats.upcomingEvents}</h4>
                <span className="text-muted small">Upcoming Live Events</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs: My Events vs Recent Sales */}
      <Tabs defaultActiveKey="events" className="mb-4">
        {/* TAB 1: MY EVENTS */}
        <Tab eventKey="events" title={<span className="fw-semibold">My Events ({myEvents.length})</span>}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {/* Filter and Search Bar */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className={`btn ${statusFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({counts.all})
                  </button>
                  <button
                    type="button"
                    className={`btn ${statusFilter === 'published' ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('published')}
                  >
                    Published ({counts.published})
                  </button>
                  <button
                    type="button"
                    className={`btn ${statusFilter === 'draft' ? 'btn-warning' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('draft')}
                  >
                    Drafts ({counts.draft})
                  </button>
                  <button
                    type="button"
                    className={`btn ${statusFilter === 'cancelled' ? 'btn-danger' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('cancelled')}
                  >
                    Cancelled ({counts.cancelled})
                  </button>
                </div>

                <InputGroup style={{ maxWidth: '280px' }}>
                  <InputGroup.Text className="bg-white border-end-0">
                    <Search size={16} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search your events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-start-0 ps-0"
                  />
                </InputGroup>
              </div>

              {/* Event Table or Empty State */}
              {filteredEvents.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Calendar size={48} className="mb-3 opacity-50" />
                  <h6 className="fw-bold">No events found</h6>
                  <p className="small mb-3">
                    {myEvents.length === 0
                      ? 'You have not created any events yet.'
                      : 'No events match the selected filter criteria.'}
                  </p>
                  {myEvents.length === 0 && (
                    <Button as={Link} to="/create-event" variant="primary" size="sm">
                      <Plus size={16} className="me-1" /> Create Your First Event
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Event</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Capacity & Attendance</th>
                        <th>Ticket Revenue</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => {
                        const currentAttendees = event.currentAttendees || 0;
                        const maxAttendees = event.maxAttendees || 100;
                        const fillPercent = Math.min(100, Math.round((currentAttendees / maxAttendees) * 100));
                        const totalRevenue = event.ticketTypes?.reduce(
                          (sum, ticket) => sum + (ticket.price * (ticket.sold || 0)), 0
                        ) || 0;

                        return (
                          <tr key={event._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={event.images?.find(img => img.isMain)?.url || event.images?.[0]?.url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&fit=crop'}
                                  alt={event.title}
                                  className="rounded me-3"
                                  style={{ width: '56px', height: '42px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                                    {event.title}
                                  </div>
                                  <span className="badge bg-light text-secondary border small text-capitalize">
                                    {event.category}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="small fw-semibold">
                                {moment(event.startDate).format('MMM D, YYYY')}
                              </div>
                              <small className="text-muted">
                                {moment(event.startDate).format('h:mm A')}
                              </small>
                            </td>
                            <td>{getStatusBadge(event.status)}</td>
                            <td style={{ minWidth: '150px' }}>
                              <div className="d-flex justify-content-between small text-muted mb-1">
                                <span>{currentAttendees} booked</span>
                                <span>{event.maxAttendees ? `${maxAttendees} max` : 'Unlimited'}</span>
                              </div>
                              <ProgressBar
                                now={fillPercent}
                                variant={fillPercent > 80 ? 'danger' : fillPercent > 50 ? 'warning' : 'primary'}
                                style={{ height: '6px' }}
                              />
                            </td>
                            <td className="fw-bold text-dark">
                              {formatCurrency(totalRevenue)}
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <Button
                                  as={Link}
                                  to={`/events/${event._id}`}
                                  variant="outline-primary"
                                  size="sm"
                                  title="View Public Event Page"
                                >
                                  <Eye size={15} />
                                </Button>
                                <Button
                                  as={Link}
                                  to={`/events/${event._id}/edit`}
                                  variant="outline-secondary"
                                  size="sm"
                                  title="Edit Event"
                                >
                                  <Edit size={15} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  title="Delete Event"
                                  onClick={() => openDeleteModal(event)}
                                >
                                  <Trash2 size={15} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 2: RECENT TICKET SALES */}
        <Tab
          eventKey="sales"
          title={
            <span className="fw-semibold d-flex align-items-center">
              <Receipt size={16} className="me-1" /> Recent Ticket Sales
              {recentSales.length > 0 && (
                <Badge bg="primary" pill className="ms-2">
                  {recentSales.length}
                </Badge>
              )}
            </span>
          }
        >
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Recent Ticket Bookings</h5>
              {recentSales.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Receipt size={40} className="mb-2 opacity-50" />
                  <h6>No recent ticket sales</h6>
                  <p className="small mb-0">When attendees book tickets for your events, they will appear here.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Attendee</th>
                        <th>Event</th>
                        <th>Booking Date</th>
                        <th>Amount Paid</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSales.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <div className="fw-semibold text-dark">{booking.user?.name || 'Attendee'}</div>
                            <small className="text-muted">{booking.user?.email || 'N/A'}</small>
                          </td>
                          <td>
                            <div className="fw-semibold text-truncate" style={{ maxWidth: '240px' }}>
                              {booking.event?.title || 'Event'}
                            </div>
                          </td>
                          <td className="small">
                            {moment(booking.createdAt).format('MMM D, YYYY · h:mm A')}
                          </td>
                          <td className="fw-bold text-dark">
                            {formatCurrency(booking.totalAmount || 0)}
                          </td>
                          <td>
                            <Badge bg={booking.paymentStatus === 'paid' ? 'success' : 'warning'}>
                              {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-danger d-flex align-items-center">
            <AlertTriangle className="me-2" size={20} />
            Confirm Event Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">Are you sure you want to permanently delete this event?</p>
          <div className="p-3 bg-light rounded border mb-3">
            <strong className="text-dark">{deleteModal.eventTitle}</strong>
          </div>
          <p className="text-muted small mb-0">
            This action cannot be undone. All event details and associated ticket configurations will be removed.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Event'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DashboardPage;
