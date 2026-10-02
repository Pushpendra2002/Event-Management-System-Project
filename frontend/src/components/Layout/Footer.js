import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <Container>
        <Row>
          <Col md={4}>
            <h5>EventHub</h5>
            <p className="text-muted">
              Your premier destination for discovering and managing events.
              Connect, learn, and celebrate with us.
            </p>
          </Col>
          
          <Col md={2}>
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/events" className="text-muted text-decoration-none">Events</Link></li>
              <li><Link to="/categories" className="text-muted text-decoration-none">Categories</Link></li>
              <li><Link to="/about" className="text-muted text-decoration-none">About Us</Link></li>
              <li><Link to="/contact" className="text-muted text-decoration-none">Contact</Link></li>
            </ul>
          </Col>
          
          <Col md={2}>
            <h6>Legal</h6>
            <ul className="list-unstyled">
              <li><Link to="/privacy" className="text-muted text-decoration-none">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted text-decoration-none">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-muted text-decoration-none">Cookie Policy</Link></li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h6>Contact Us</h6>
            <p className="text-muted">
              Email: info@eventhub.com<br />
              Phone: (123) 456-7890<br />
              Address: 123 Event Street, City, Country
            </p>
            <div className="d-flex gap-3">
              <a href="https://www.facebook.com" className="text-white-50 text-decoration-none hover-lift" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://x.com" className="text-white-50 text-decoration-none hover-lift" target="_blank" rel="noreferrer" aria-label="X">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com" className="text-white-50 text-decoration-none hover-lift" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com" className="text-white-50 text-decoration-none hover-lift" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </Col>
        </Row>
        
        <hr className="bg-secondary" />
        
        <Row>
          <Col className="text-center text-muted">
            <small>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
