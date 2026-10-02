import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Form, InputGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFeaturedEvents } from '../features/events/eventSlice';
import { ArrowRight, Search, Calendar, Users, Award, CheckCircle } from 'lucide-react';
import EventCard from '../components/Events/EventCard';
import { eventAPI } from '../services/api';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredEvents } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const [heroSearch, setHeroSearch] = useState('');
  const [platformStats, setPlatformStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalOrganizers: 0,
    satisfactionRate: 98
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchFeaturedEvents());

    eventAPI.getPlatformStats()
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setPlatformStats(res.data.data);
        }
      })
      .catch((err) => {
        console.warn('Could not load real public platform stats:', err);
      })
      .finally(() => setStatsLoading(false));
  }, [dispatch]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/events?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const categories = [
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'conference', name: 'Conference', icon: '🎤' },
    { id: 'workshop', name: 'Workshop', icon: '🔧' },
    { id: 'festival', name: 'Festival', icon: '🎉' },
    { id: 'networking', name: 'Networking', icon: '🤝' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary bg-gradient text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">
                Discover & Manage Events Like Never Before
              </h1>
              <p className="lead mb-4">
                Join thousands of people discovering amazing events, connecting with 
                communities, and creating unforgettable experiences.
              </p>
              
              <Form onSubmit={handleHeroSearch} className="mb-4">
                <InputGroup size="lg" className="shadow-sm rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-white border-0 ps-3">
                    <Search className="text-muted" size={20} />
                  </InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="Search concerts, workshops, sports..."
                    className="border-0 shadow-none ps-2"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                  />
                  <Button variant="light" type="submit" className="px-4 fw-bold text-primary">
                    Search
                  </Button>
                </InputGroup>
              </Form>

              <div className="d-flex gap-3">
                <Button as={Link} to="/events" variant="light" size="lg">
                  Explore Events
                </Button>
                {!user && (
                  <Button as={Link} to="/register" variant="outline-light" size="lg">
                    Get Started
                  </Button>
                )}
              </div>
            </Col>
            <Col lg={6}>
              <div className="position-relative">
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-10 rounded-3"></div>
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Event celebration"
                  className="img-fluid rounded-3 shadow-lg"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Real Platform Statistics Section */}
      <section className="py-5 bg-white border-top border-bottom">
        <Container>
          <Row className="text-center g-4">
            <Col sm={6} md={3}>
              <div className="d-flex flex-column align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 mb-2">
                  <Calendar size={28} />
                </div>
                <div className="display-5 fw-bold text-dark mb-1">
                  {statsLoading ? (
                    <span className="placeholder col-6">...</span>
                  ) : (
                    platformStats.totalEvents > 0 ? `${platformStats.totalEvents}+` : '0'
                  )}
                </div>
                <p className="text-muted fw-medium mb-0">Live Events</p>
              </div>
            </Col>

            <Col sm={6} md={3}>
              <div className="d-flex flex-column align-items-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 mb-2">
                  <Users size={28} />
                </div>
                <div className="display-5 fw-bold text-dark mb-1">
                  {statsLoading ? (
                    <span className="placeholder col-6">...</span>
                  ) : (
                    platformStats.totalAttendees > 0 ? `${platformStats.totalAttendees}+` : '0'
                  )}
                </div>
                <p className="text-muted fw-medium mb-0">Total Attendees</p>
              </div>
            </Col>

            <Col sm={6} md={3}>
              <div className="d-flex flex-column align-items-center">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 mb-2">
                  <Award size={28} />
                </div>
                <div className="display-5 fw-bold text-dark mb-1">
                  {statsLoading ? (
                    <span className="placeholder col-6">...</span>
                  ) : (
                    platformStats.totalOrganizers > 0 ? `${platformStats.totalOrganizers}+` : '0'
                  )}
                </div>
                <p className="text-muted fw-medium mb-0">Verified Hosts</p>
              </div>
            </Col>

            <Col sm={6} md={3}>
              <div className="d-flex flex-column align-items-center">
                <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 mb-2">
                  <CheckCircle size={28} />
                </div>
                <div className="display-5 fw-bold text-dark mb-1">
                  {statsLoading ? (
                    <span className="placeholder col-6">...</span>
                  ) : (
                    `${platformStats.satisfactionRate}%`
                  )}
                </div>
                <p className="text-muted fw-medium mb-0">Satisfaction Rate</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Browse by Category</h2>
            <p className="text-muted">Find events that match your interests</p>
          </div>
          <Row>
            {categories.map((category) => (
              <Col key={category.id} md={4} lg={2} className="mb-3">
                <Card
                  as={Link}
                  to={`/events?category=${category.id}`}
                  className="text-center border-0 shadow-sm h-100 text-decoration-none text-dark hover-lift"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <Card.Body className="p-3">
                    <div className="display-6 mb-2">{category.icon}</div>
                    <h6 className="fw-bold mb-1">{category.name}</h6>
                    <small className="text-primary fw-medium">Explore &rarr;</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Events */}
      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h2 className="fw-bold mb-2">Featured Events</h2>
              <p className="text-muted">Hand-picked events you don't want to miss</p>
            </div>
            <Button as={Link} to="/events" variant="outline-primary">
              View All <ArrowRight size={20} />
            </Button>
          </div>
          
          {featuredEvents.length > 0 ? (
            <Row>
              {featuredEvents.slice(0, 3).map((event) => (
                <Col key={event._id} lg={4} className="mb-4">
                  <EventCard event={event} />
                </Col>
              ))}
            </Row>
          ) : (
            <Row>
              {[1, 2, 3].map((i) => (
                <Col key={i} lg={4} className="mb-4">
                  <Card className="h-100">
                    <div className="placeholder-glow">
                      <div className="placeholder col-12" style={{ height: '200px' }}></div>
                      <Card.Body>
                        <div className="placeholder col-8 mb-2"></div>
                        <div className="placeholder col-10 mb-3"></div>
                        <div className="placeholder col-12 mb-2"></div>
                        <div className="placeholder col-6"></div>
                      </Card.Body>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="align-items-center">
            {user?.role === 'user' ? (
              <>
                <Col lg={8}>
                  <h2 className="fw-bold mb-3">Looking for Your Next Experience?</h2>
                  <p className="lead mb-0 text-white-50">
                    Discover trending concerts, conferences, sports matches, and cultural festivals happening around you.
                  </p>
                </Col>
                <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
                  <Button as={Link} to="/events" variant="primary" size="lg" className="shadow-sm">
                    Explore Events
                  </Button>
                </Col>
              </>
            ) : (user?.role === 'organizer' || user?.role === 'admin') ? (
              <>
                <Col lg={8}>
                  <h2 className="fw-bold mb-3">Ready to Host Your Next Event?</h2>
                  <p className="lead mb-0 text-white-50">
                    Publish tickets, track sales, and connect with attendees seamlessly in Organizer Studio.
                  </p>
                </Col>
                <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
                  <Button as={Link} to="/create-event" variant="light" size="lg" className="shadow-sm">
                    Create Event
                  </Button>
                </Col>
              </>
            ) : (
              <>
                <Col lg={8}>
                  <h2 className="fw-bold mb-3">Join the EventPulse Community</h2>
                  <p className="lead mb-0 text-white-50">
                    Discover incredible live events or register as an organizer to publish your own.
                  </p>
                </Col>
                <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
                  <Button as={Link} to="/events" variant="light" size="lg" className="shadow-sm">
                    Explore Events
                  </Button>
                </Col>
              </>
            )}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
