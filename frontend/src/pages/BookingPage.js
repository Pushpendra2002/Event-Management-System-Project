import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBookings, cancelBooking } from '../features/bookings/bookingSlice';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { Calendar, MapPin, Users, Ticket, Printer, X, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import moment from 'moment';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../utils/formatters';

const BookingPage = () => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleCancelBooking = async () => {
    if (selectedBooking && cancelReason) {
      try {
        await dispatch(cancelBooking({ id: selectedBooking._id, reason: cancelReason })).unwrap();
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancelReason('');
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  // Counts for filter pills
  const totalCount = bookings.length;
  const upcomingCount = bookings.filter(b => new Date(b.event?.startDate) > new Date() && b.status !== 'cancelled').length;
  const pastCount = bookings.filter(b => new Date(b.event?.startDate) <= new Date() && b.status !== 'cancelled').length;
  const paidCount = bookings.filter(b => b.paymentStatus === 'paid' && b.status !== 'cancelled').length;
  const pendingCount = bookings.filter(b => b.paymentStatus === 'pending').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(booking.event?.startDate) > new Date() && booking.status !== 'cancelled';
    if (filter === 'past') return new Date(booking.event?.startDate) <= new Date() && booking.status !== 'cancelled';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return booking.paymentStatus === filter;
  });

  const getStatusBadge = (booking) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Pending' },
      paid: { variant: 'success', label: 'Confirmed' },
      failed: { variant: 'danger', label: 'Failed' },
      refunded: { variant: 'info', label: 'Refunded' },
      cancelled: { variant: 'secondary', label: 'Cancelled' }
    };

    const { variant, label } = statusMap[booking.paymentStatus] || { variant: 'secondary', label: 'Unknown' };
    return <Badge bg={variant} className="px-2 py-1">{label}</Badge>;
  };

  const handlePrintTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading your bookings and digital passes...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">My Bookings & Passes</h1>
        <p className="text-muted">Manage your event registrations and present your digital QR entry passes</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col sm={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle me-3">
                <Ticket size={24} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{totalCount}</h4>
                <small className="text-muted">Total Bookings</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle me-3">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{paidCount}</h4>
                <small className="text-muted">Confirmed</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle me-3">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{pendingCount}</h4>
                <small className="text-muted">Pending Payment</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle me-3">
                <XCircle size={24} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{cancelledCount}</h4>
                <small className="text-muted">Cancelled</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter Tabs */}
      <Card className="mb-4 border-0 shadow-sm rounded-3">
        <Card.Body className="py-2">
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All', count: totalCount },
              { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
              { id: 'past', label: 'Past Events', count: pastCount },
              { id: 'paid', label: 'Confirmed', count: paidCount },
              { id: 'pending', label: 'Pending', count: pendingCount },
              { id: 'cancelled', label: 'Cancelled', count: cancelledCount }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={filter === tab.id ? 'primary' : 'light'}
                size="sm"
                className="d-flex align-items-center gap-1 px-3 py-2 fw-medium rounded-pill"
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
                <Badge
                  bg={filter === tab.id ? 'white' : 'secondary'}
                  text={filter === tab.id ? 'primary' : 'white'}
                  pill
                  className="ms-1"
                >
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-3 text-center py-5 px-3">
          <Card.Body>
            <div className="bg-light text-primary rounded-circle d-inline-flex p-4 mb-3">
              <Ticket size={48} />
            </div>
            <h4 className="fw-bold mb-2">
              {filter === 'all'
                ? "You haven't booked any events yet"
                : `No ${filter} bookings found`}
            </h4>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '460px' }}>
              Explore upcoming concerts, conferences, workshops, and festivals happening near you.
            </p>
            <Button as={Link} to="/events" variant="primary" size="lg" className="px-4">
              Explore Events <ArrowRight size={18} className="ms-1" />
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredBookings.map((booking) => (
            <Col key={booking._id} lg={12} className="mb-4">
              <div className="ticket-pass shadow-sm">
                <Row className="g-0">
                  {/* Left Side: Event Details */}
                  <Col md={8} className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      {/* Status row */}
                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <div className="d-flex align-items-center gap-2">
                          {getStatusBadge(booking)}
                          {booking.checkInStatus ? (
                            <Badge bg="success" className="px-2 py-1">
                              <CheckCircle size={12} className="me-1" /> Checked In
                            </Badge>
                          ) : (
                            <Badge bg="light" text="dark" className="border px-2 py-1">
                              Ready for Entry
                            </Badge>
                          )}
                          {booking.event?.category && (
                            <Badge bg="light" text="muted" className="border text-uppercase small">
                              {booking.event.category}
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted">
                          Booked {moment(booking.createdAt).format('MMM D, YYYY')}
                        </small>
                      </div>

                      {/* Title & Venue */}
                      <h4 className="fw-bold mb-2">
                        {booking.event ? (
                          <Link to={`/events/${booking.event._id}`} className="text-decoration-none text-dark hover-primary">
                            {booking.event.title}
                          </Link>
                        ) : (
                          'Event Details Unavailable'
                        )}
                      </h4>

                      <div className="d-flex flex-wrap gap-4 text-muted mb-3">
                        <div className="d-flex align-items-center">
                          <Calendar size={16} className="text-primary me-2" />
                          <small className="fw-medium text-dark">
                            {moment(booking.event?.startDate).format('dddd, MMMM D, YYYY • h:mm A')}
                          </small>
                        </div>
                        <div className="d-flex align-items-center">
                          <MapPin size={16} className="text-primary me-2" />
                          <small>
                            {booking.event?.isOnline
                              ? 'Virtual Online Event'
                              : booking.event?.venue?.name || 'Venue TBA'}
                          </small>
                        </div>
                      </div>

                      {/* Ticket Tier & Attendees */}
                      <div className="bg-light p-3 rounded-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-dark small">
                            <Ticket size={16} className="me-1 text-primary" />
                            {booking.quantity} × {booking.ticketType?.name || 'General Admission'}
                          </span>
                          <span className="fw-bold text-primary">
                            {formatCurrency(booking.totalAmount || 0)}
                          </span>
                        </div>

                        {booking.attendees?.length > 0 && (
                          <div className="pt-2 border-top">
                            <small className="text-muted d-block mb-1">Registered Attendees:</small>
                            <div className="d-flex flex-wrap gap-2">
                              {booking.attendees.map((attendee, index) => (
                                <span
                                  key={index}
                                  className="badge bg-white text-dark border fw-normal py-1 px-2"
                                >
                                  <Users size={12} className="me-1 text-muted" />
                                  {attendee.name || `Attendee ${index + 1}`}
                                  {attendee.email && ` (${attendee.email})`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions for Mobile */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="small text-muted">
                        Payment: <span className="text-uppercase fw-semibold">{booking.paymentMethod || 'Stripe'}</span>
                      </div>
                    </div>
                  </Col>

                  {/* Right Side: QR Code Stub */}
                  <Col
                    md={4}
                    className="ticket-pass-divider bg-light bg-opacity-50 p-4 d-flex flex-column align-items-center justify-content-center text-center"
                  >
                    <small className="text-uppercase tracking-wider fw-bold text-muted mb-2">Digital Entry Pass</small>

                    {booking.ticketNumber && (
                      <code className="fw-bold fs-6 text-dark px-2 py-1 bg-white border rounded mb-3">
                        {booking.ticketNumber}
                      </code>
                    )}

                    <div className="p-3 bg-white rounded-3 shadow-sm mb-2">
                      <QRCodeSVG
                        value={
                          JSON.stringify({
                            bookingId: booking._id,
                            ticketNumber: booking.ticketNumber,
                            eventId: booking.event?._id
                          })
                        }
                        size={110}
                      />
                    </div>
                    <small className="text-muted mb-3">Present at door for QR scanner</small>

                    {/* Actions */}
                    <div className="d-flex gap-2 w-100 justify-content-center">
                      <Button
                        variant="outline-dark"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={handlePrintTicket}
                        title="Print or Save PDF ticket"
                      >
                        <Printer size={15} /> Print Pass
                      </Button>

                      {booking.paymentStatus === 'paid' &&
                        booking.status !== 'cancelled' &&
                        new Date(booking.event?.startDate) > new Date() && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="d-flex align-items-center gap-1"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCancelModal(true);
                            }}
                            title="Cancel booking"
                          >
                            <X size={15} /> Cancel
                          </Button>
                        )}
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Cancel Event Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <Alert variant="warning" className="border-0">
                <strong>Cancellation Policy:</strong> Bookings can only be cancelled at least 24 hours prior to the event. A refund will be issued to your payment method.
              </Alert>

              <div className="mb-3 p-3 bg-light rounded-3">
                <small className="text-muted">Event to cancel:</small>
                <h6 className="fw-bold mb-1">{selectedBooking.event?.title}</h6>
                <p className="text-muted small mb-0">
                  {moment(selectedBooking.event?.startDate).format('MMMM D, YYYY • h:mm A')}
                </p>
                <div className="mt-2 text-primary fw-bold">
                  Refund Amount: {formatCurrency(selectedBooking.totalAmount || 0)}
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Reason for cancellation *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please let us know why you are cancelling..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelBooking}
            disabled={!cancelReason.trim()}
          >
            Confirm Cancellation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingPage;
