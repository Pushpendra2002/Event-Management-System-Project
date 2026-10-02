import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent, updateEvent } from '../features/events/eventSlice';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Form as BootstrapForm,
  Badge,
  InputGroup
} from 'react-bootstrap';
import {
  FileText,
  Calendar,
  Ticket,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatters';
import { eventAPI } from '../services/api';

const categoryImages = {
  music: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop',
  conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop',
  workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop',
  festival: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop',
  technology: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop',
  food: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1000&auto=format&fit=crop',
  art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1000&auto=format&fit=crop',
  business: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000&auto=format&fit=crop',
  education: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1000&auto=format&fit=crop',
  health: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop',
  networking: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&auto=format&fit=crop',
  charity: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1000&auto=format&fit=crop',
  exhibition: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?w=1000&auto=format&fit=crop',
  other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop'
};

const categories = [
  'music', 'sports', 'conference', 'workshop', 'festival',
  'exhibition', 'networking', 'charity', 'food', 'art',
  'technology', 'business', 'education', 'health', 'other'
];

const requirementsList = [
  { value: 'age-18+', label: 'Age 18+ Only' },
  { value: 'id-required', label: 'Government Photo ID Required' },
  { value: 'vaccination', label: 'Vaccination Proof / Certificate' },
  { value: 'dress-code', label: 'Formal / Smart Casual Dress Code' },
  { value: 'byob', label: 'Bring Your Own Device / Laptop' }
];

const CreateEventPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loadingEvent, setLoadingEvent] = useState(isEditMode);

  // Helper date conversions
  const formatDateTimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  };

  const formatDateLocal = (value) => formatDateTimeLocal(value).slice(0, 10);

  // Initial Form Values
  const [formInitialValues, setFormInitialValues] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: [],
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    endDate: new Date(Date.now() + 28 * 60 * 60 * 1000),   // tomorrow + 4 hrs
    venue: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      }
    },
    isOnline: false,
    onlineLink: '',
    ticketTypes: [{
      name: 'General Admission',
      description: 'Standard access to the event',
      price: 499,
      quantity: 100,
      salesEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }],
    maxAttendees: '',
    privacy: 'public',
    requirements: []
  });

  // Load existing event data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setLoadingEvent(true);
      eventAPI.getEvent(id)
        .then((res) => {
          if (res.data?.data) {
            const ev = res.data.data;
            setFormInitialValues({
              title: ev.title || '',
              description: ev.description || '',
              shortDescription: ev.shortDescription || '',
              category: ev.category || '',
              tags: ev.tags || [],
              startDate: new Date(ev.startDate),
              endDate: new Date(ev.endDate),
              venue: ev.venue || {
                name: '',
                address: { street: '', city: '', state: '', zipCode: '', country: 'India' }
              },
              isOnline: Boolean(ev.isOnline),
              onlineLink: ev.onlineLink || '',
              ticketTypes: ev.ticketTypes?.length > 0 ? ev.ticketTypes : [{
                name: 'General Admission',
                description: 'Standard access to the event',
                price: 499,
                quantity: 100,
                salesEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              }],
              maxAttendees: ev.maxAttendees || '',
              privacy: ev.privacy || 'public',
              requirements: ev.requirements || []
            });

            if (ev.images && ev.images.length > 0) {
              setImages(ev.images.map((img) => ({ url: img.url, isMain: img.isMain })));
            }
          }
        })
        .catch(() => {
          toast.error('Could not load event details for editing.');
        })
        .finally(() => setLoadingEvent(false));
    }
  }, [id, isEditMode]);

  // Validation Schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Event title is required')
      .max(100, 'Title cannot exceed 100 characters'),
    description: Yup.string()
      .required('Full description is required')
      .max(2000, 'Description cannot exceed 2000 characters'),
    shortDescription: Yup.string()
      .max(200, 'Short description cannot exceed 200 characters'),
    category: Yup.string()
      .required('Please select a category'),
    startDate: Yup.date()
      .required('Start date is required'),
    endDate: Yup.date()
      .required('End date is required')
      .min(Yup.ref('startDate'), 'End date must be after start date'),
    venue: Yup.object().when('isOnline', {
      is: false,
      then: (schema) => schema.shape({
        name: Yup.string().required('Venue or hall name is required'),
        address: Yup.object().shape({
          city: Yup.string().required('City is required')
        })
      })
    }),
    onlineLink: Yup.string().when('isOnline', {
      is: true,
      then: (schema) => schema.url('Please provide a valid URL (e.g., https://meet.google.com/...)').required('Online meeting link is required')
    }),
    ticketTypes: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Ticket tier name is required'),
        price: Yup.number().min(0, 'Price cannot be negative').required('Price is required'),
        quantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required')
      })
    ).min(1, 'At least one ticket type is required')
  });

  // Handle Image Upload
  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, i) => ({
      url: URL.createObjectURL(file),
      file,
      isMain: images.length === 0 && i === 0
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: imageUrlInput.trim(), isMain: prev.length === 0 }
    ]);
    setImageUrlInput('');
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = [...prev];
      const wasMain = updated[index]?.isMain;
      updated.splice(index, 1);
      if (wasMain && updated.length > 0) {
        updated[0].isMain = true;
      }
      return updated;
    });
  };

  const setMainImage = (index) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isMain: i === index
      }))
    );
  };

  // Submit Handler
  const handleSubmit = async (values) => {
    try {
      const payload = { ...values };

      // Ensure images are formatted properly
      if (images.length > 0) {
        payload.images = images.map((img, i) => ({
          url: img.url,
          isMain: img.isMain ?? (i === 0)
        }));
      } else {
        const fallbackUrl = categoryImages[values.category] || categoryImages['other'];
        payload.images = [{ url: fallbackUrl, isMain: true }];
      }

      if (isEditMode) {
        await dispatch(updateEvent({ id, eventData: payload })).unwrap();
        toast.success('Event updated successfully!');
        navigate(`/events/${id}`);
      } else {
        const created = await dispatch(createEvent(payload)).unwrap();
        toast.success('Event created successfully!');
        navigate(created?._id ? `/events/${created._id}` : '/organizer/dashboard');
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to save event. Please check inputs.');
    }
  };

  if (loadingEvent) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading event details...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4 py-lg-5">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge bg={isEditMode ? 'warning' : 'primary'} text={isEditMode ? 'dark' : 'white'} className="px-2 py-1">
              {isEditMode ? 'Edit Mode' : 'Organizer Studio'}
            </Badge>
          </div>
          <h2 className="fw-bold mb-1">
            {isEditMode ? `Edit Event: ${formInitialValues.title || 'Event'}` : 'Create an Unforgettable Event'}
          </h2>
          <p className="text-muted mb-0">
            {isEditMode
              ? 'Update your event details, ticket tiers, or schedule'
              : 'Complete the steps below to publish your event to thousands of attendees'}
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <Button as={Link} to="/organizer/dashboard" variant="outline-secondary" size="sm">
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stepper Navigation */}
      <div className="stepper-nav mb-4 shadow-sm">
        <button
          type="button"
          className={`stepper-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <span className="step-num-badge">{currentStep > 1 ? <Check size={13} /> : '1'}</span>
          <FileText size={16} /> Basic Details
        </button>

        <button
          type="button"
          className={`stepper-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(2)}
        >
          <span className="step-num-badge">{currentStep > 2 ? <Check size={13} /> : '2'}</span>
          <Calendar size={16} /> Date & Venue
        </button>

        <button
          type="button"
          className={`stepper-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(3)}
        >
          <span className="step-num-badge">{currentStep > 3 ? <Check size={13} /> : '3'}</span>
          <Ticket size={16} /> Tickets & Pricing
        </button>

        <button
          type="button"
          className={`stepper-item ${currentStep === 4 ? 'active' : ''}`}
          onClick={() => setCurrentStep(4)}
        >
          <span className="step-num-badge">4</span>
          <ImageIcon size={16} /> Media & Review
        </button>
      </div>

      <Formik
        initialValues={formInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, errors, touched }) => {
          // Dynamic pricing calculation for preview
          const lowestPrice = values.ticketTypes?.reduce((min, t) => {
            const p = Number(t.price) || 0;
            return p < min ? p : min;
          }, Infinity);

          const mainImageSrc = images.find(img => img.isMain)?.url ||
            images[0]?.url ||
            categoryImages[values.category] ||
            categoryImages['other'];

          return (
            <Form>
              <Row className="g-4">
                {/* Form Inputs Column */}
                <Col lg={8}>
                  {/* STEP 1: BASIC DETAILS */}
                  {currentStep === 1 && (
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-2">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0">Step 1: Event Fundamentals</h5>
                            <small className="text-muted">Set the name, category, and captivating overview</small>
                          </div>
                        </div>
                        <hr className="my-3 text-muted" />

                        {/* Title */}
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            Event Title <span className="text-danger">*</span>
                          </label>
                          <Field
                            name="title"
                            type="text"
                            className={`form-control ${touched.title && errors.title ? 'is-invalid' : ''}`}
                            placeholder="e.g., Bengaluru Tech Summit 2026 or Sunburn Music Festival"
                          />
                          <ErrorMessage name="title" component="div" className="invalid-feedback" />
                        </div>

                        {/* Category */}
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            Category <span className="text-danger">*</span>
                          </label>
                          <Field
                            as="select"
                            name="category"
                            className={`form-select ${touched.category && errors.category ? 'is-invalid' : ''}`}
                          >
                            <option value="">-- Choose Category --</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="category" component="div" className="invalid-feedback" />
                        </div>

                        {/* Short Description */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <label className="form-label fw-semibold">Short Catchy Tagline</label>
                            <small className="text-muted">{values.shortDescription?.length || 0}/200</small>
                          </div>
                          <Field
                            name="shortDescription"
                            as="textarea"
                            rows={2}
                            maxLength={200}
                            className="form-control"
                            placeholder="A 1-2 sentence hook that appears on event cards..."
                          />
                        </div>

                        {/* Full Description */}
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            Full Event Description <span className="text-danger">*</span>
                          </label>
                          <Field
                            name="description"
                            as="textarea"
                            rows={5}
                            className={`form-control ${touched.description && errors.description ? 'is-invalid' : ''}`}
                            placeholder="Detail everything your attendees need to know: schedule, lineup, takeaways, prerequisites..."
                          />
                          <ErrorMessage name="description" component="div" className="invalid-feedback" />
                        </div>

                        {/* Tags */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Search Tags</label>
                          <Field
                            name="tags"
                            type="text"
                            className="form-control"
                            placeholder="e.g., ai, tech, networking, startup (comma separated)"
                            value={Array.isArray(values.tags) ? values.tags.join(', ') : values.tags}
                            onChange={(e) => {
                              const split = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                              setFieldValue('tags', split);
                            }}
                          />
                          <small className="text-muted">Separate keywords with commas to help attendees search</small>
                        </div>

                        {/* Step 1 Actions */}
                        <div className="d-flex justify-content-end">
                          <Button
                            variant="primary"
                            onClick={() => setCurrentStep(2)}
                            className="d-flex align-items-center"
                          >
                            Next: Date & Venue <ArrowRight size={16} className="ms-2" />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* STEP 2: DATE & VENUE */}
                  {currentStep === 2 && (
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-success bg-opacity-10 text-success rounded-circle p-2 me-2">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0">Step 2: Schedule & Location</h5>
                            <small className="text-muted">Specify date, timing, and physical venue or meeting link</small>
                          </div>
                        </div>
                        <hr className="my-3 text-muted" />

                        {/* Start & End Times */}
                        <Row className="g-3 mb-4">
                          <Col md={6}>
                            <label className="form-label fw-semibold">
                              Start Date & Time <span className="text-danger">*</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={formatDateTimeLocal(values.startDate)}
                              onChange={(e) => setFieldValue('startDate', new Date(e.target.value))}
                              className="form-control"
                              min={formatDateTimeLocal(new Date())}
                            />
                            <ErrorMessage name="startDate" component="div" className="text-danger small mt-1" />
                          </Col>

                          <Col md={6}>
                            <label className="form-label fw-semibold">
                              End Date & Time <span className="text-danger">*</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={formatDateTimeLocal(values.endDate)}
                              onChange={(e) => setFieldValue('endDate', new Date(e.target.value))}
                              className="form-control"
                              min={formatDateTimeLocal(values.startDate)}
                            />
                            <ErrorMessage name="endDate" component="div" className="text-danger small mt-1" />
                          </Col>
                        </Row>

                        {/* Online / Physical Toggle */}
                        <div className="p-3 bg-light rounded border mb-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong className="d-block text-dark">Event Format</strong>
                              <small className="text-muted">
                                {values.isOnline ? 'Online / Virtual Webinar or Stream' : 'Physical In-Person Venue'}
                              </small>
                            </div>
                            <BootstrapForm.Check
                              type="switch"
                              id="isOnlineSwitch"
                              checked={values.isOnline}
                              label={values.isOnline ? 'Virtual' : 'In-Person'}
                              onChange={(e) => setFieldValue('isOnline', e.target.checked)}
                            />
                          </div>
                        </div>

                        {/* Location Details */}
                        {values.isOnline ? (
                          <div className="mb-4">
                            <label className="form-label fw-semibold">
                              Virtual Event Link <span className="text-danger">*</span>
                            </label>
                            <InputGroup>
                              <InputGroup.Text className="bg-white">
                                <LinkIcon size={16} />
                              </InputGroup.Text>
                              <Field
                                name="onlineLink"
                                type="url"
                                className="form-control"
                                placeholder="https://meet.google.com/xxx-yyyy-zzz or Zoom URL"
                              />
                            </InputGroup>
                            <ErrorMessage name="onlineLink" component="div" className="text-danger small mt-1" />
                          </div>
                        ) : (
                          <>
                            <div className="mb-3">
                              <label className="form-label fw-semibold">
                                Venue Name <span className="text-danger">*</span>
                              </label>
                              <Field
                                name="venue.name"
                                type="text"
                                className="form-control"
                                placeholder="e.g., Palace Grounds or Marriott Grand Ballroom"
                              />
                              <ErrorMessage name="venue.name" component="div" className="text-danger small mt-1" />
                            </div>

                            <Row className="g-3 mb-3">
                              <Col md={8}>
                                <label className="form-label fw-semibold">Street Address</label>
                                <Field
                                  name="venue.address.street"
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g., 100 Feet Road, Indiranagar"
                                />
                              </Col>
                              <Col md={4}>
                                <label className="form-label fw-semibold">
                                  City <span className="text-danger">*</span>
                                </label>
                                <Field
                                  name="venue.address.city"
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g., Bengaluru"
                                />
                                <ErrorMessage name="venue.address.city" component="div" className="text-danger small mt-1" />
                              </Col>
                            </Row>

                            <Row className="g-3 mb-4">
                              <Col md={4}>
                                <label className="form-label fw-semibold">State</label>
                                <Field
                                  name="venue.address.state"
                                  type="text"
                                  className="form-control"
                                  placeholder="Karnataka"
                                />
                              </Col>
                              <Col md={4}>
                                <label className="form-label fw-semibold">PIN / Zip Code</label>
                                <Field
                                  name="venue.address.zipCode"
                                  type="text"
                                  className="form-control"
                                  placeholder="560038"
                                />
                              </Col>
                              <Col md={4}>
                                <label className="form-label fw-semibold">Country</label>
                                <Field
                                  name="venue.address.country"
                                  type="text"
                                  className="form-control"
                                  placeholder="India"
                                />
                              </Col>
                            </Row>
                          </>
                        )}

                        {/* Step 2 Actions */}
                        <div className="d-flex justify-content-between">
                          <Button variant="outline-secondary" onClick={() => setCurrentStep(1)}>
                            <ArrowLeft size={16} className="me-2" /> Back
                          </Button>
                          <Button variant="primary" onClick={() => setCurrentStep(3)}>
                            Next: Tickets & Pricing <ArrowRight size={16} className="ms-2" />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* STEP 3: TICKET TIERS & PRICING */}
                  {currentStep === 3 && (
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-2">
                            <Ticket size={20} />
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0">Step 3: Ticket Tiers & Pricing</h5>
                            <small className="text-muted">Configure pricing in Indian Rupees (₹) and ticket inventory</small>
                          </div>
                        </div>
                        <hr className="my-3 text-muted" />

                        <FieldArray name="ticketTypes">
                          {({ push, remove }) => (
                            <div>
                              {values.ticketTypes.map((ticket, index) => (
                                <Card key={index} className="border mb-3 shadow-none bg-light">
                                  <Card.Body className="p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <span className="badge bg-primary text-white">Tier {index + 1}</span>
                                      {values.ticketTypes.length > 1 && (
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => remove(index)}
                                          title="Delete ticket tier"
                                        >
                                          <Trash2 size={14} className="me-1" /> Remove
                                        </Button>
                                      )}
                                    </div>

                                    <Row className="g-3 mb-2">
                                      <Col md={7}>
                                        <label className="form-label small fw-semibold">
                                          Ticket Name <span className="text-danger">*</span>
                                        </label>
                                        <Field
                                          name={`ticketTypes.${index}.name`}
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="e.g., Early Bird, VIP Pass, Student Pass"
                                        />
                                        <ErrorMessage
                                          name={`ticketTypes.${index}.name`}
                                          component="div"
                                          className="text-danger small"
                                        />
                                      </Col>
                                      <Col md={5}>
                                        <label className="form-label small fw-semibold">
                                          Price (₹) <span className="text-danger">*</span>
                                        </label>
                                        <InputGroup size="sm">
                                          <InputGroup.Text className="bg-white">₹</InputGroup.Text>
                                          <Field
                                            name={`ticketTypes.${index}.price`}
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            step="1"
                                          />
                                          <Button
                                            variant="outline-secondary"
                                            onClick={() => setFieldValue(`ticketTypes.${index}.price`, 0)}
                                            title="Make Free"
                                          >
                                            Free
                                          </Button>
                                        </InputGroup>
                                        <ErrorMessage
                                          name={`ticketTypes.${index}.price`}
                                          component="div"
                                          className="text-danger small"
                                        />
                                      </Col>
                                    </Row>

                                    <Row className="g-3 mb-2">
                                      <Col md={6}>
                                        <label className="form-label small fw-semibold">
                                          Quantity Available <span className="text-danger">*</span>
                                        </label>
                                        <Field
                                          name={`ticketTypes.${index}.quantity`}
                                          type="number"
                                          className="form-control form-control-sm"
                                          min="1"
                                        />
                                        <ErrorMessage
                                          name={`ticketTypes.${index}.quantity`}
                                          component="div"
                                          className="text-danger small"
                                        />
                                      </Col>
                                      <Col md={6}>
                                        <label className="form-label small fw-semibold">Sales End Date</label>
                                        <input
                                          type="date"
                                          value={formatDateLocal(ticket.salesEndDate)}
                                          onChange={(e) =>
                                            setFieldValue(
                                              `ticketTypes.${index}.salesEndDate`,
                                              e.target.value ? new Date(e.target.value) : null
                                            )
                                          }
                                          className="form-control form-control-sm"
                                          min={formatDateLocal(new Date())}
                                        />
                                      </Col>
                                    </Row>

                                    <div>
                                      <label className="form-label small fw-semibold">What's Included</label>
                                      <Field
                                        name={`ticketTypes.${index}.description`}
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="e.g., Includes event swag, buffet lunch, workshop entry"
                                      />
                                    </div>
                                  </Card.Body>
                                </Card>
                              ))}

                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() =>
                                  push({
                                    name: '',
                                    description: '',
                                    price: 0,
                                    quantity: 100,
                                    salesEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                  })
                                }
                                className="mb-4"
                              >
                                <Plus size={16} className="me-1" /> Add Another Ticket Tier
                              </Button>
                            </div>
                          )}
                        </FieldArray>

                        {/* Step 3 Actions */}
                        <div className="d-flex justify-content-between">
                          <Button variant="outline-secondary" onClick={() => setCurrentStep(2)}>
                            <ArrowLeft size={16} className="me-2" /> Back
                          </Button>
                          <Button variant="primary" onClick={() => setCurrentStep(4)}>
                            Next: Media & Review <ArrowRight size={16} className="ms-2" />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* STEP 4: MEDIA & SETTINGS */}
                  {currentStep === 4 && (
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-info bg-opacity-10 text-info rounded-circle p-2 me-2">
                            <ImageIcon size={20} />
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0">Step 4: Media & Final Settings</h5>
                            <small className="text-muted">Upload high-res banners and configure attendee settings</small>
                          </div>
                        </div>
                        <hr className="my-3 text-muted" />

                        {/* Image Upload Dropzone */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Event Banner Images</label>

                          <div className="dropzone-box mb-3 position-relative">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageFiles}
                              className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                            />
                            <Upload size={32} className="text-primary mb-2" />
                            <h6 className="fw-bold mb-1">Click or drag & drop images here</h6>
                            <p className="small text-muted mb-0">PNG, JPG, or WEBP up to 5MB (16:9 ratio recommended)</p>
                          </div>

                          {/* Image URL input alternative */}
                          <div className="d-flex gap-2 mb-3">
                            <InputGroup size="sm">
                              <InputGroup.Text className="bg-white">
                                <LinkIcon size={14} />
                              </InputGroup.Text>
                              <Form.Control
                                type="url"
                                placeholder="Or paste an image web URL (https://...)"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                              />
                              <Button variant="outline-secondary" onClick={handleAddImageUrl}>
                                Add URL
                              </Button>
                            </InputGroup>
                          </div>

                          {/* Image Previews */}
                          {images.length > 0 && (
                            <Row className="g-2 mb-4">
                              {images.map((image, index) => (
                                <Col key={index} xs={6} sm={4} md={3}>
                                  <div className={`image-preview-card ${image.isMain ? 'is-main' : ''}`}>
                                    <img
                                      src={image.url}
                                      alt={`Preview ${index + 1}`}
                                      style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute top-0 end-0 p-1">
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        className="p-1 lh-1 rounded-circle"
                                        onClick={() => removeImage(index)}
                                      >
                                        <X size={12} />
                                      </Button>
                                    </div>

                                    {image.isMain ? (
                                      <div className="position-absolute bottom-0 start-0 w-100 bg-primary text-white text-center py-1 small fw-semibold">
                                        Main Banner
                                      </div>
                                    ) : (
                                      <Button
                                        variant="dark"
                                        size="sm"
                                        className="position-absolute bottom-0 start-0 w-100 rounded-0 py-0 small bg-opacity-75"
                                        onClick={() => setMainImage(index)}
                                      >
                                        Set Main
                                      </Button>
                                    )}
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          )}
                        </div>

                        {/* Capacity & Privacy Settings */}
                        <Row className="g-3 mb-4">
                          <Col md={6}>
                            <label className="form-label fw-semibold">Total Event Capacity</label>
                            <Field
                              name="maxAttendees"
                              type="number"
                              className="form-control"
                              placeholder="e.g. 500 (leave empty for unlimited)"
                              min="1"
                            />
                          </Col>

                          <Col md={6}>
                            <label className="form-label fw-semibold">Event Visibility</label>
                            <Field as="select" name="privacy" className="form-select">
                              <option value="public">Public - Listed on discovery page</option>
                              <option value="private">Private - Direct link access only</option>
                              <option value="invite-only">Invite Only</option>
                            </Field>
                          </Col>
                        </Row>

                        {/* Attendee Requirements */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Attendee Entry Requirements</label>
                          <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                            {requirementsList.map((req) => (
                              <div key={req.value} className="form-check">
                                <Field
                                  type="checkbox"
                                  name="requirements"
                                  value={req.value}
                                  id={`req-${req.value}`}
                                  className="form-check-input"
                                />
                                <label htmlFor={`req-${req.value}`} className="form-check-label small">
                                  {req.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Final Review & Submission */}
                        <div className="d-flex justify-content-between pt-3 border-top">
                          <Button variant="outline-secondary" onClick={() => setCurrentStep(3)}>
                            <ArrowLeft size={16} className="me-2" /> Back
                          </Button>
                          <Button
                            type="submit"
                            variant="success"
                            size="lg"
                            disabled={isSubmitting || loading}
                            className="px-4 fw-bold shadow-sm"
                          >
                            {isSubmitting || loading ? (
                              <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                {isEditMode ? 'Updating Event...' : 'Publishing Event...'}
                              </>
                            ) : (
                              <>
                                <CheckCircle size={18} className="me-2" />
                                {isEditMode ? 'Save & Update Event' : 'Publish Event Now'}
                              </>
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </Col>

                {/* Right Sticky Preview Column */}
                <Col lg={4}>
                  <div className="position-sticky" style={{ top: '90px' }}>
                    <Card className="border-0 shadow-sm overflow-hidden mb-3">
                      <div className="position-relative" style={{ height: '180px' }}>
                        <img
                          src={mainImageSrc}
                          alt="Live Preview Banner"
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                        <div className="position-absolute top-0 start-0 m-2">
                          <span className="badge bg-primary text-capitalize shadow-sm">
                            {values.category || 'Category'}
                          </span>
                        </div>
                        <div className="position-absolute top-0 end-0 m-2">
                          <Badge bg="dark" className="bg-opacity-75">
                            {values.isOnline ? 'Virtual' : 'In-Person'}
                          </Badge>
                        </div>
                      </div>

                      <Card.Body className="p-3">
                        <div className="text-muted small mb-1 d-flex align-items-center">
                          <Calendar size={13} className="me-1 text-primary" />
                          {values.startDate
                            ? new Date(values.startDate).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Date TBA'}
                          {' · '}
                          {values.startDate
                            ? new Date(values.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Time'}
                        </div>

                        <h6 className="fw-bold text-dark text-truncate mb-2">
                          {values.title || 'Your Event Title Will Appear Here'}
                        </h6>

                        <p className="text-muted small line-clamp-2 mb-3" style={{ minHeight: '36px' }}>
                          {values.shortDescription || values.description || 'A brief summary of your event will be displayed to prospective attendees here.'}
                        </p>

                        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                          <div>
                            <span className="text-muted small d-block">Starting from</span>
                            <span className="fw-bold text-primary">
                              {lowestPrice === 0
                                ? 'Free Entry'
                                : lowestPrice < Infinity
                                ? formatCurrency(lowestPrice)
                                : '₹0'}
                            </span>
                          </div>
                          <div className="text-muted small text-end">
                            <span className="d-block">Host</span>
                            <span className="fw-semibold text-dark">{user?.name || 'You'}</span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>

                    {/* Step Guidance Tips */}
                    <Card className="border-0 bg-light">
                      <Card.Body className="p-3">
                        <h6 className="fw-bold text-dark d-flex align-items-center small mb-2">
                          <Sparkles size={16} className="text-warning me-2" />
                          Pro Host Tip
                        </h6>
                        <p className="text-muted small mb-0">
                          {currentStep === 1 && 'Clear, specific titles and concise short descriptions generate up to 40% higher click-through rates.'}
                          {currentStep === 2 && 'Setting precise venue addresses helps attendees get accurate GPS navigation and calendar reminders.'}
                          {currentStep === 3 && 'Offering an Early Bird tier with limited quantity creates urgency and drives early ticket sales.'}
                          {currentStep === 4 && 'Events with crisp 16:9 banner images receive double the social media shares.'}
                        </p>
                      </Card.Body>
                    </Card>
                  </div>
                </Col>
              </Row>
            </Form>
          );
        }}
      </Formik>
    </Container>
  );
};

export default CreateEventPage;
