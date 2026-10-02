import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '../features/events/eventSlice';
import { createBooking } from '../features/bookings/bookingSlice';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Calendar, MapPin, Users, Star, Share2, Bookmark, Ticket, Check } from 'lucide-react';
import moment from 'moment';
import { formatCurrency } from '../utils/formatters';

const EventDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentEvent, loading, error } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState([{ name: '', email: '', phone: '' }]);

  useEffect(() => {
    dispatch(fetchEvent(id));
  }, [dispatch, id]);

  const handleQuantityChange = (newQty) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    setAttendees((prev) => {
      if (prev.length < validQty) {
        const added = Array.from({ length: validQty - prev.length }, () => ({
          name: '',
          email: '',
          phone: ''
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, validQty);
    });
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (!selectedTicket) {
      alert('Please select a ticket type');
      return;
    }

    const bookingData = {
      eventId: id,
      ticketTypeId: selectedTicket._id,
      quantity,
      attendees: attendees.slice(0, quantity)
    };

    try {
      await dispatch(createBooking(bookingData)).unwrap();
      alert('Booking created successfully! Redirecting to bookings...');
      navigate('/bookings');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAttendeeChange = (index, field, value) => {
    setAttendees((prev) =>
      prev.map((att, i) => (i === index ? { ...att, [field]: value } : att))
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading event details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </Container>
    );
  }

  if (!currentEvent) {
    return null;
  }

  const formatDate = (date) => {
    return moment(date).format('dddd, MMMM D, YYYY • h:mm A');
  };

  const formatDuration = (start, end) => {
    const duration = moment.duration(moment(end).diff(moment(start)));
    const hours = duration.hours();
    const minutes = duration.minutes();
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours} hours ${minutes} minutes`;
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          {/* Event Images */}
          <div className="mb-4">
            <div className="position-relative">
              <img
                src={currentEvent.images?.find(img => img.isMain)?.url || '/default-event.jpg'}
                alt={currentEvent.title}
                className="img-fluid rounded-3 w-100"
                style={{ height: '400px', objectFit: 'cover' }}
              />
              {currentEvent.featured && (
                <Badge
                  bg="warning"
                  className="position-absolute"
                  style={{ top: '20px', right: '20px' }}
                >
                  Featured
                </Badge>
              )}
            </div>
            
            {currentEvent.images?.length > 1 && (
              <div className="d-flex gap-2 mt-3">
                {currentEvent.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${currentEvent.title} ${index + 1}`}
                    className="img-thumbnail"
                    style={{ width: '100px', height: '80px', objectFit: 'cover' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 className="fw-bold mb-2">{currentEvent.title}</h1>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <Badge bg="primary" className="fs-6">
                    {currentEvent.category.charAt(0).toUpperCase() + currentEvent.category.slice(1)}
                  </Badge>
                  <div className="d-flex align-items-center text-warning">
                    <Star size={20} className="me-1" />
                    <span className="fw-bold">{currentEvent.rating?.average?.toFixed(1) || '0.0'}</span>
                    <span className="text-muted ms-1">({currentEvent.rating?.count || 0} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm">
                  <Share2 size={16} className="me-1" />
                  Share
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <Bookmark size={16} className="me-1" />
                  Save
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <h4>About This Event</h4>
              <p className="lead">{currentEvent.description}</p>
            </div>

            {/* Event Info Cards */}
            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <Calendar className="text-primary me-2" />
                      <h6 className="mb-0">Date & Time</h6>
                    </div>
                    <p className="mb-1">
                      {formatDate(currentEvent.startDate)}
                    </p>
                    <small className="text-muted">
                      Duration: {formatDuration(currentEvent.startDate, currentEvent.endDate)}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <MapPin className="text-primary me-2" />
                      <h6 className="mb-0">Location</h6>
                    </div>
                    {currentEvent.isOnline ? (
                      <>
                        <p className="mb-1">Online Event</p>
                        <a href={currentEvent.onlineLink} target="_blank" rel="noreferrer">
                          {currentEvent.onlineLink}
                        </a>
                      </>
                    ) : (
                      <>
                        <p className="mb-1 fw-bold">{currentEvent.venue?.name}</p>
                        <p className="mb-1 text-muted">
                          {currentEvent.venue?.address?.street && `${currentEvent.venue.address.street}, `}
                          {currentEvent.venue?.address?.city}
                          {currentEvent.venue?.address?.state && `, ${currentEvent.venue.address.state}`}
                          {currentEvent.venue?.address?.zipCode && ` ${currentEvent.venue.address.zipCode}`}
                        </p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Organizer Info */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Organizer</h5>
                <div className="d-flex align-items-center">
                  <img
                    src={currentEvent.organizer?.profilePhoto || '/default-avatar.jpg'}
                    alt={currentEvent.organizerName}
                    className="rounded-circle me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="mb-1">{currentEvent.organizerName}</h6>
                    <p className="text-muted small mb-0">
                      {currentEvent.organizer?.bio || 'Event organizer'}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>

        {/* Booking Sidebar */}
        <Col lg={4}>
          <Card className="sticky-top border-0 shadow-sm" style={{ top: '85px', zIndex: 10 }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Get Tickets</h4>
                <Badge bg="light" text="dark">
                  <Users size={16} className="me-1" />
                  {currentEvent.currentAttendees} / {currentEvent.maxAttendees || '∞'}
                </Badge>
              </div>

              {/* Ticket Selection */}
              <div className="mb-4">
                <h6 className="mb-3">Select Ticket Type</h6>
                {currentEvent.ticketTypes?.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`p-3 mb-2 border rounded-3 position-relative ${
                      selectedTicket?._id === ticket._id
                        ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                        : 'border-light-subtle hover-lift'
                    }`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="mb-0 fw-bold">{ticket.name}</h6>
                          {selectedTicket?._id === ticket._id && (
                            <Badge bg="primary" pill className="p-1">
                              <Check size={12} />
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted small mb-2">{ticket.description}</p>
                        <div className="d-flex align-items-center">
                          <Badge bg="light" text="dark" className="me-2">
                            {ticket.quantity - ticket.sold} left
                          </Badge>
                          <small className="text-muted">
                            Sales end: {moment(ticket.salesEndDate).format('MMM D')}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="h4 mb-0 text-primary fw-bold">
                          {ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)}
                        </div>
                        <small className="text-muted">per ticket</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity Selection */}
              {selectedTicket && (
                <>
                  <div className="mb-4">
                    <h6 className="mb-3">Quantity</h6>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="mx-3 fs-5 fw-bold">{quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= (selectedTicket.quantity - selectedTicket.sold)}
                      >
                        +
                      </Button>
                      <span className="ms-3 text-muted small">
                        (Max available: {selectedTicket.quantity - selectedTicket.sold})
                      </span>
                    </div>
                  </div>

                  {/* Attendee Information */}
                  {quantity > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Attendee Information</h6>
                      {attendees.slice(0, quantity).map((attendee, index) => (
                        <div key={index} className="mb-3 p-3 bg-light rounded-3">
                          <h6 className="small fw-bold mb-2">Attendee {index + 1}</h6>
                          <div className="mb-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Full Name"
                              value={attendee.name}
                              onChange={(e) =>
                                handleAttendeeChange(index, 'name', e.target.value)
                              }
                            />
                          </div>
                          <div className="mb-2">
                            <input
                              type="email"
                              className="form-control form-control-sm"
                              placeholder="Email"
                              value={attendee.email}
                              onChange={(e) =>
                                handleAttendeeChange(index, 'email', e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              className="form-control form-control-sm"
                              placeholder="Phone (optional)"
                              value={attendee.phone}
                              onChange={(e) =>
                                handleAttendeeChange(index, 'phone', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  <div className="mb-4 p-3 bg-light rounded-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span className="fw-medium">{formatCurrency(selectedTicket.price * quantity)}</span>
                    </div>
                    {selectedTicket.price > 0 && (
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">GST (18%)</span>
                        <span className="fw-medium">{formatCurrency(selectedTicket.price * quantity * 0.18)}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold">Total</h5>
                      <h4 className="mb-0 text-primary fw-bold">
                        {formatCurrency(
                          selectedTicket.price > 0
                            ? selectedTicket.price * quantity * 1.18
                            : 0
                        )}
                      </h4>
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    onClick={handleBooking}
                  >
                    <Ticket className="me-2" />
                    Book Now
                  </Button>

                  <div className="text-center">
                    <small className="text-muted">
                      Secure checkout
                    </small>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetailPage;
