import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, fetchFeaturedEvents } from '../../features/events/eventSlice';
import { Container, Row, Col, Form, InputGroup, Card, Badge, Alert, Pagination } from 'react-bootstrap';
import { Search, Calendar, X } from 'lucide-react';
import EventCard from './EventCard';
import EventFilters from './EventFilters';

const EventList = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { events, featuredEvents, loading, error, pagination } = useSelector(
    (state) => state.events
  );
  
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState({
    category: initialCategory,
    status: 'published',
    featured: '',
    startDate: '',
    endDate: '',
    price: 'all',
    search: initialSearch,
    sort: '-createdAt',
    page: 1,
    limit: 12
  });

  // Keep state in sync with URL searchParams
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    
    setFilters((prev) => {
      if (prev.category !== urlCategory || prev.search !== urlSearch) {
        return {
          ...prev,
          category: urlCategory,
          search: urlSearch,
          page: 1
        };
      }
      return prev;
    });

    setSearchTerm(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    // Exclude client-only filters like price when querying backend
    const { price, ...apiFilters } = filters;
    dispatch(fetchEvents(apiFilters));
    dispatch(fetchFeaturedEvents());
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      nextParams.set('search', searchTerm.trim());
    } else {
      nextParams.delete('search');
    }
    setSearchParams(nextParams);
    setFilters((prev) => ({ ...prev, search: searchTerm.trim(), page: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newFilters.category !== undefined) {
      if (newFilters.category) {
        nextParams.set('category', newFilters.category);
      } else {
        nextParams.delete('category');
      }
    }
    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        nextParams.set('search', newFilters.search);
      } else {
        nextParams.delete('search');
      }
    }
    setSearchParams(nextParams);
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const displayedEvents = events.filter((event) => {
    if (filters.price === 'free') return event.ticketTypes?.some((t) => t.price === 0);
    if (filters.price === 'paid') return event.ticketTypes?.some((t) => t.price > 0);
    return true;
  });

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-3">Discover Amazing Events</h1>
            <p className="lead text-muted">
              Find events that match your interests and connect with like-minded people
            </p>
          </div>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={8} lg={6} className="mx-auto">
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search events by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </InputGroup>
          </Form>
        </Col>
      </Row>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <>
          <Row className="mb-4">
            <Col>
              <h3 className="mb-3">
                <Calendar className="me-2" />
                Featured Events
              </h3>
            </Col>
          </Row>
          <Row className="mb-5">
            {featuredEvents.map((event) => (
              <Col key={event._id} md={6} lg={4} className="mb-4">
                <EventCard event={event} />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Filters and Events */}
      <Row>
        <Col lg={3}>
          <EventFilters filters={filters} onFilterChange={handleFilterChange} />
        </Col>
        
        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0 fw-bold">All Events</h4>
            <span className="text-muted small">
              {displayedEvents.length} events found
            </span>
          </div>

          {/* Active Filter Chips */}
          {(filters.category || filters.search || (filters.price && filters.price !== 'all')) && (
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3 p-2 bg-light rounded-3">
              <span className="small text-muted me-1">Active filters:</span>
              {filters.category && (
                <Badge bg="primary" className="d-flex align-items-center gap-1 py-1 px-2">
                  Category: {filters.category}
                  <X
                    size={14}
                    className="cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleFilterChange({ category: '' })}
                  />
                </Badge>
              )}
              {filters.search && (
                <Badge bg="secondary" className="d-flex align-items-center gap-1 py-1 px-2">
                  Search: "{filters.search}"
                  <X
                    size={14}
                    className="cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSearchTerm('');
                      handleFilterChange({ search: '' });
                    }}
                  />
                </Badge>
              )}
              {filters.price && filters.price !== 'all' && (
                <Badge bg="info" text="dark" className="d-flex align-items-center gap-1 py-1 px-2">
                  Price: {filters.price.toUpperCase()}
                  <X
                    size={14}
                    className="cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleFilterChange({ price: 'all' })}
                  />
                </Badge>
              )}
              <button
                className="btn btn-sm btn-link text-muted p-0 ms-auto small text-decoration-none"
                onClick={() => {
                  setSearchTerm('');
                  handleFilterChange({ category: '', search: '', price: 'all' });
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <Row>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Col key={n} md={6} lg={4} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm overflow-hidden placeholder-glow">
                    <div className="placeholder col-12 bg-secondary bg-opacity-25" style={{ height: '200px' }}></div>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between mb-3">
                        <span className="placeholder col-4 rounded-pill py-2 bg-secondary bg-opacity-25"></span>
                        <span className="placeholder col-2 rounded-pill py-2 bg-secondary bg-opacity-25"></span>
                      </div>
                      <div className="placeholder col-10 mb-2 py-2 rounded bg-secondary bg-opacity-25" aria-hidden="true"></div>
                      <p className="placeholder col-12 py-1 mb-1 rounded bg-secondary bg-opacity-25"></p>
                      <p className="placeholder col-8 py-1 mb-4 rounded bg-secondary bg-opacity-25"></p>
                      <div className="mt-auto">
                        <div className="placeholder col-6 py-2 mb-2 rounded bg-secondary bg-opacity-25"></div>
                        <div className="placeholder col-12 py-3 rounded-2 bg-secondary bg-opacity-25"></div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : displayedEvents.length === 0 ? (
            <Alert variant="info" className="border-0 shadow-sm rounded-3 text-center py-5">
              <Alert.Heading className="fw-bold">No events found</Alert.Heading>
              <p className="text-muted mb-3">Try adjusting your filters or search terms to find what you are looking for.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSearchTerm('');
                  handleFilterChange({ category: '', search: '', startDate: '', endDate: '', price: 'all' });
                }}
              >
                Reset All Filters
              </button>
            </Alert>
          ) : (
            <>
              <Row>
                  {displayedEvents.map((event) => (
                    <Col key={event._id} md={6} lg={4} className="mb-4">
                      <EventCard event={event} />
                    </Col>
                  ))}
                </Row>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <Pagination>
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={filters.page === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                    />
                    
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= filters.page - 2 && page <= filters.page + 2)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === filters.page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      } else if (
                        page === filters.page - 3 ||
                        page === filters.page + 3
                      ) {
                        return <Pagination.Ellipsis key={page} />;
                      }
                      return null;
                    })}
                    
                    <Pagination.Next
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === pagination.totalPages}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={filters.page === pagination.totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EventList;
