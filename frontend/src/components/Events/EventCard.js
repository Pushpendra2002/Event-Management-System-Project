import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import moment from 'moment';
import { formatCurrency } from '../../utils/formatters';

const EventCard = ({ event }) => {
  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY • h:mm A');
  };

  const getCategoryBadge = (category) => {
    const categories = {
      music: 'primary',
      sports: 'success',
      conference: 'info',
      workshop: 'warning',
      festival: 'danger',
      exhibition: 'secondary',
      networking: 'dark',
      charity: 'success',
      food: 'warning',
      art: 'info',
      technology: 'primary',
      business: 'dark',
      education: 'info',
      health: 'success',
      other: 'secondary'
    };
    
    return categories[category] || 'secondary';
  };

  return (
    <Card className="h-100 shadow-sm border-0 hover-lift">
      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
        <Card.Img
          variant="top"
          src={event.images?.find(img => img.isMain)?.url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {event.featured && (
          <Badge
            bg="warning"
            className="position-absolute"
            style={{ top: '10px', right: '10px' }}
          >
            Featured
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Badge bg={getCategoryBadge(event.category || 'other')}>
            {event.category ? (event.category.charAt(0).toUpperCase() + event.category.slice(1)) : 'General'}
          </Badge>
          <div className="d-flex align-items-center">
            <Star size={16} className="text-warning me-1" />
            <span>{typeof event.rating?.average === 'number' ? event.rating.average.toFixed(1) : '0.0'}</span>
            <span className="text-muted ms-1">({event.rating?.count || 0})</span>
          </div>
        </div>
        
        <Card.Title className="mb-3">
          <Link to={`/events/${event._id}`} className="text-decoration-none text-dark">
            {event.title}
          </Link>
        </Card.Title>
        
        <Card.Text className="flex-grow-1 text-muted">
          {event.shortDescription || 
           (event.description && event.description.length > 100 
            ? `${event.description.substring(0, 100)}...` 
            : (event.description || 'No description provided.'))}
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex align-items-center text-muted mb-2">
            <Calendar size={16} className="me-2" />
            <small>{formatDate(event.startDate)}</small>
          </div>
          
          <div className="d-flex align-items-center text-muted mb-3">
            <MapPin size={16} className="me-2" />
            <small>
              {event.isOnline ? 'Online Event' : event.venue?.name || 'Venue TBA'}
            </small>
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Users size={16} className="me-1" />
              <small>
                {event.currentAttendees} / {event.maxAttendees || '∞'}
              </small>
            </div>
            
            {event.ticketTypes?.length > 0 && (() => {
              const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
              return (
                <Badge bg={minPrice === 0 ? "success" : "light"} text={minPrice === 0 ? "white" : "dark"} className="px-2 py-1">
                  {minPrice === 0 ? 'Free' : `From ${formatCurrency(minPrice)}`}
                </Badge>
              );
            })()}
          </div>
          
          <Button
            as={Link}
            to={`/events/${event._id}`}
            variant="primary"
            className="w-100 mt-3"
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EventCard;