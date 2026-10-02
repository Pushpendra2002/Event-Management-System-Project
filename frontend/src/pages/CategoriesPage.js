import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Music, Trophy, Mic, Wrench, PartyPopper, Palette, Cpu, Briefcase, Book, Heart } from 'lucide-react';

const CategoriesPage = () => {
  
  const categories = [
    { id: 'music', name: 'Music', icon: <Music size={32} />, color: 'primary', count: 45 },
    { id: 'sports', name: 'Sports', icon: <Trophy size={32} />, color: 'success', count: 32 },
    { id: 'conference', name: 'Conference', icon: <Mic size={32} />, color: 'info', count: 28 },
    { id: 'workshop', name: 'Workshop', icon: <Wrench size={32} />, color: 'warning', count: 36 },
    { id: 'festival', name: 'Festival', icon: <PartyPopper size={32} />, color: 'danger', count: 19 },
    { id: 'art', name: 'Art', icon: <Palette size={32} />, color: 'secondary', count: 27 },
    { id: 'technology', name: 'Technology', icon: <Cpu size={32} />, color: 'dark', count: 41 },
    { id: 'business', name: 'Business', icon: <Briefcase size={32} />, color: 'primary', count: 33 },
    { id: 'education', name: 'Education', icon: <Book size={32} />, color: 'info', count: 29 },
    { id: 'charity', name: 'Charity', icon: <Heart size={32} />, color: 'danger', count: 18 },
    { id: 'food', name: 'Food & Drink', icon: '🍔', color: 'warning', count: 22 },
    { id: 'networking', name: 'Networking', icon: '🤝', color: 'success', count: 24 }
  ];

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Browse by Category</h1>
        <p className="lead text-muted">
          Discover events that match your interests and passions
        </p>
      </div>

      {/* Categories Grid */}
      <Row className="g-4">
        {categories.map((category) => (
          <Col key={category.id} md={4} lg={3}>
            <Card 
              as={Link} 
              to={`/events?category=${category.id}`}
              className="h-100 text-decoration-none text-dark border-0 shadow-sm hover-lift"
              style={{ transition: 'all 0.3s' }}
            >
              <Card.Body className="text-center p-4">
                <div className={`mb-3 text-${category.color}`}>
                  {typeof category.icon === 'string' ? (
                    <span style={{ fontSize: '2.5rem' }}>{category.icon}</span>
                  ) : (
                    category.icon
                  )}
                </div>
                <h5 className="fw-bold mb-2">{category.name}</h5>
                <p className="text-muted mb-0">{category.count} events</p>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 text-center">
                <small className="text-primary">Browse events →</small>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* All Events Button */}
      <div className="text-center mt-5">
        <Link to="/events" className="btn btn-primary btn-lg">
          View All Events
        </Link>
      </div>
    </Container>
  );
};

export default CategoriesPage;
