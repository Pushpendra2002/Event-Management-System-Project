import React from 'react';
import { Card, Form, Badge } from 'react-bootstrap';
import { Filter, RotateCcw } from 'lucide-react';

const EventFilters = ({ filters, onFilterChange }) => {
  const categories = [
    'music', 'sports', 'conference', 'workshop', 'festival',
    'exhibition', 'networking', 'charity', 'food', 'art',
    'technology', 'business', 'education', 'health', 'other'
  ];

  const handleFilterChange = (name, value) => {
    onFilterChange({ [name]: value });
  };

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <Filter size={18} className="text-primary me-2" />
            <h5 className="mb-0 fw-bold">Filters</h5>
          </div>
          {(filters.category || filters.startDate || filters.price) && (
            <button
              className="btn btn-sm btn-link text-decoration-none p-0 text-muted"
              onClick={() => onFilterChange({
                category: '',
                startDate: '',
                endDate: '',
                price: 'all',
                page: 1
              })}
            >
              <RotateCcw size={14} className="me-1" />
              Reset
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <h6 className="fw-bold mb-2 small text-uppercase text-muted">Categories</h6>
          <div className="d-flex flex-wrap gap-1">
            <Badge
              bg={!filters.category ? 'primary' : 'light'}
              text={!filters.category ? 'white' : 'dark'}
              className="p-2 cursor-pointer border"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => handleFilterChange('category', '')}
            >
              All
            </Badge>
            {categories.map((category) => {
              const isSelected = filters.category === category;
              return (
                <Badge
                  key={category}
                  bg={isSelected ? 'primary' : 'light'}
                  text={isSelected ? 'white' : 'dark'}
                  className="p-2 cursor-pointer border"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleFilterChange('category', isSelected ? '' : category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Date Filter */}
        <div className="mb-4">
          <h6 className="fw-bold mb-2 small text-uppercase text-muted">Date</h6>
          <div className="d-flex flex-column gap-2">
            <Form.Check
              type="radio"
              id="date-all"
              label="All Dates"
              name="date"
              checked={!filters.startDate && !filters.endDate}
              onChange={() => handleFilterChange('startDate', '')}
            />
            <Form.Check
              type="radio"
              id="date-today"
              label="Today"
              name="date"
              checked={Boolean(filters.startDate && filters.startDate === new Date().toISOString().split('T')[0])}
              onChange={() => {
                const today = new Date().toISOString().split('T')[0];
                handleFilterChange('startDate', today);
              }}
            />
            <Form.Check
              type="radio"
              id="date-weekend"
              label="This Weekend"
              name="date"
              onChange={() => {
                const today = new Date();
                const saturday = new Date(today);
                saturday.setDate(today.getDate() + (6 - today.getDay()));
                handleFilterChange('startDate', saturday.toISOString().split('T')[0]);
              }}
            />
            <Form.Check
              type="radio"
              id="date-week"
              label="This Week"
              name="date"
              onChange={() => {
                const today = new Date();
                handleFilterChange('startDate', today.toISOString().split('T')[0]);
              }}
            />
          </div>
        </div>

        {/* Price Filter */}
        <div className="mb-4">
          <h6 className="fw-bold mb-2 small text-uppercase text-muted">Price</h6>
          <div className="d-flex flex-column gap-2">
            <Form.Check
              type="radio"
              id="price-all"
              label="All Prices"
              name="price"
              checked={!filters.price || filters.price === 'all'}
              onChange={() => handleFilterChange('price', 'all')}
            />
            <Form.Check
              type="radio"
              id="price-free"
              label="Free"
              name="price"
              checked={filters.price === 'free'}
              onChange={() => handleFilterChange('price', 'free')}
            />
            <Form.Check
              type="radio"
              id="price-paid"
              label="Paid"
              name="price"
              checked={filters.price === 'paid'}
              onChange={() => handleFilterChange('price', 'paid')}
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-4">
          <h6 className="fw-bold mb-2 small text-uppercase text-muted">Sort By</h6>
          <Form.Select
            size="sm"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="startDate">Date (Soonest)</option>
            <option value="-startDate">Date (Latest)</option>
            <option value="-rating.average">Highest Rated</option>
          </Form.Select>
        </div>

        {/* Reset Filters Button */}
        <button
          className="btn btn-outline-secondary btn-sm w-100"
          onClick={() => onFilterChange({
            category: '',
            startDate: '',
            endDate: '',
            price: 'all',
            sort: '-createdAt',
            page: 1
          })}
        >
          Reset All Filters
        </button>
      </Card.Body>
    </Card>
  );
};

export default EventFilters;