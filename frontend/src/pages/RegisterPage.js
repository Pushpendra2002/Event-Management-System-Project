import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../features/auth/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Alert, Spinner, Button, InputGroup } from 'react-bootstrap';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Sparkles,
  Ticket,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phone: '',
    terms: false
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email address is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
    terms: Yup.boolean()
      .oneOf([true], 'You must accept the Terms of Service to continue')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const { confirmPassword, terms, ...userData } = values;
    try {
      await dispatch(register(userData)).unwrap();
    } catch {
      // Handled by redux error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col lg={11} xl={10}>
            <Card className="border-0 shadow-lg overflow-hidden rounded-4">
              <Row className="g-0">
                {/* Left Side: Brand & Benefits */}
                <Col
                  lg={5}
                  className="d-none d-lg-flex flex-column justify-content-between p-5 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)'
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-white bg-opacity-20 rounded-circle p-2">
                        <Sparkles size={22} className="text-warning" />
                      </div>
                      <span className="fw-bold fs-5">EventPulse</span>
                    </div>

                    <h3 className="fw-bold mb-3 text-white">
                      Start Hosting or Attending Events Today
                    </h3>
                    <p className="text-white-50 small mb-4">
                      Create an account in less than a minute. Choose between attending events or hosting your own with full ticketing control.
                    </p>

                    <div className="d-flex flex-column gap-3 mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-15 rounded-circle p-2">
                          <Ticket size={18} className="text-white" />
                        </div>
                        <div className="small">
                          <strong className="d-block text-white">Free & Paid Ticketing</strong>
                          <span className="text-white-50">Manage inventory and ticket tiers in INR (₹)</span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-15 rounded-circle p-2">
                          <Calendar size={18} className="text-white" />
                        </div>
                        <div className="small">
                          <strong className="d-block text-white">Organizer Dashboard</strong>
                          <span className="text-white-50">Comprehensive analytics, attendance, and revenue</span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-15 rounded-circle p-2">
                          <CheckCircle size={18} className="text-white" />
                        </div>
                        <div className="small">
                          <strong className="d-block text-white">Instant QR Code Entry</strong>
                          <span className="text-white-50">Seamless boarding pass check-ins on mobile</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-10">
                    <p className="small text-white fst-italic mb-1">
                      "Created our first tech meetup in 5 minutes and sold out 150 passes in 2 days!"
                    </p>
                    <span className="small text-white-50 fw-semibold">— DevConnect Team</span>
                  </div>
                </Col>

                {/* Right Side: Registration Form */}
                <Col lg={7} className="p-4 p-md-5 bg-white">
                  <div className="text-center text-lg-start mb-4">
                    <h2 className="fw-bold text-dark mb-1">Create Account</h2>
                    <p className="text-muted small">
                      Join thousands of attendees and event organizers.
                    </p>
                  </div>

                  {error && (
                    <Alert
                      variant="danger"
                      onClose={() => dispatch(clearError())}
                      dismissible
                      className="small shadow-sm"
                    >
                      {error}
                    </Alert>
                  )}

                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                      <Form>
                        {/* Interactive Role Card Selector */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold small d-block mb-2">
                            I want to register as:
                          </label>
                          <Row className="g-2">
                            <Col sm={6}>
                              <div
                                onClick={() => setFieldValue('role', 'user')}
                                className={`p-3 rounded-3 border text-start cursor-pointer transition ${
                                  values.role === 'user'
                                    ? 'border-primary bg-primary bg-opacity-10 text-primary shadow-sm'
                                    : 'border-light-subtle bg-light text-muted'
                                }`}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <Ticket size={18} />
                                  <strong className="d-block text-dark">Attendee</strong>
                                </div>
                                <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>
                                  Discover events & buy tickets
                                </small>
                              </div>
                            </Col>

                            <Col sm={6}>
                              <div
                                onClick={() => setFieldValue('role', 'organizer')}
                                className={`p-3 rounded-3 border text-start cursor-pointer transition ${
                                  values.role === 'organizer'
                                    ? 'border-primary bg-primary bg-opacity-10 text-primary shadow-sm'
                                    : 'border-light-subtle bg-light text-muted'
                                }`}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <Calendar size={18} />
                                  <strong className="d-block text-dark">Event Organizer</strong>
                                </div>
                                <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>
                                  Create events & sell tickets
                                </small>
                              </div>
                            </Col>
                          </Row>
                        </div>

                        {/* Name & Email Row */}
                        <Row className="g-3 mb-3">
                          <Col sm={6}>
                            <label htmlFor="name" className="form-label fw-semibold small">
                              Full Name <span className="text-danger">*</span>
                            </label>
                            <InputGroup>
                              <InputGroup.Text className="bg-light border-end-0">
                                <User size={16} className="text-muted" />
                              </InputGroup.Text>
                              <Field
                                type="text"
                                name="name"
                                id="name"
                                className={`form-control border-start-0 ps-0 ${
                                  errors.name && touched.name ? 'is-invalid' : ''
                                }`}
                                placeholder="e.g. Rahul Sharma"
                              />
                              <ErrorMessage
                                name="name"
                                component="div"
                                className="invalid-feedback"
                              />
                            </InputGroup>
                          </Col>

                          <Col sm={6}>
                            <label htmlFor="email" className="form-label fw-semibold small">
                              Email Address <span className="text-danger">*</span>
                            </label>
                            <InputGroup>
                              <InputGroup.Text className="bg-light border-end-0">
                                <Mail size={16} className="text-muted" />
                              </InputGroup.Text>
                              <Field
                                type="email"
                                name="email"
                                id="email"
                                className={`form-control border-start-0 ps-0 ${
                                  errors.email && touched.email ? 'is-invalid' : ''
                                }`}
                                placeholder="name@example.com"
                              />
                              <ErrorMessage
                                name="email"
                                component="div"
                                className="invalid-feedback"
                              />
                            </InputGroup>
                          </Col>
                        </Row>

                        {/* Phone Number */}
                        <div className="mb-3">
                          <label htmlFor="phone" className="form-label fw-semibold small">
                            Phone Number (Optional)
                          </label>
                          <InputGroup>
                            <InputGroup.Text className="bg-light border-end-0">
                              <Phone size={16} className="text-muted" />
                            </InputGroup.Text>
                            <Field
                              type="tel"
                              name="phone"
                              id="phone"
                              className={`form-control border-start-0 ps-0 ${
                                errors.phone && touched.phone ? 'is-invalid' : ''
                              }`}
                              placeholder="+91 98765 43210"
                            />
                            <ErrorMessage
                              name="phone"
                              component="div"
                              className="invalid-feedback"
                            />
                          </InputGroup>
                        </div>

                        {/* Password & Confirm Password */}
                        <Row className="g-3 mb-3">
                          <Col sm={6}>
                            <label htmlFor="password" className="form-label fw-semibold small">
                              Password <span className="text-danger">*</span>
                            </label>
                            <InputGroup>
                              <InputGroup.Text className="bg-light border-end-0">
                                <Lock size={16} className="text-muted" />
                              </InputGroup.Text>
                              <Field
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="password"
                                className={`form-control border-start-0 border-end-0 ps-0 ${
                                  errors.password && touched.password ? 'is-invalid' : ''
                                }`}
                                placeholder="Min. 6 characters"
                              />
                              <Button
                                variant="outline-secondary"
                                className="border-start-0 bg-white text-muted"
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                                title={showPassword ? 'Hide password' : 'Show password'}
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                              <ErrorMessage
                                name="password"
                                component="div"
                                className="invalid-feedback"
                              />
                            </InputGroup>
                          </Col>

                          <Col sm={6}>
                            <label htmlFor="confirmPassword" className="form-label fw-semibold small">
                              Confirm Password <span className="text-danger">*</span>
                            </label>
                            <InputGroup>
                              <InputGroup.Text className="bg-light border-end-0">
                                <Lock size={16} className="text-muted" />
                              </InputGroup.Text>
                              <Field
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                id="confirmPassword"
                                className={`form-control border-start-0 border-end-0 ps-0 ${
                                  errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''
                                }`}
                                placeholder="Repeat password"
                              />
                              <Button
                                variant="outline-secondary"
                                className="border-start-0 bg-white text-muted"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                type="button"
                                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                              <ErrorMessage
                                name="confirmPassword"
                                component="div"
                                className="invalid-feedback"
                              />
                            </InputGroup>
                          </Col>
                        </Row>

                        {/* Terms of Service Checkbox */}
                        <div className="mb-4">
                          <div className="form-check">
                            <Field
                              type="checkbox"
                              name="terms"
                              id="terms"
                              className={`form-check-input ${
                                errors.terms && touched.terms ? 'is-invalid' : ''
                              }`}
                            />
                            <label htmlFor="terms" className="form-check-label small text-muted">
                              I agree to the{' '}
                              <Link to="/terms" className="text-decoration-none text-primary">
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link to="/privacy" className="text-decoration-none text-primary">
                                Privacy Policy
                              </Link>
                            </label>
                            <ErrorMessage
                              name="terms"
                              component="div"
                              className="invalid-feedback"
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-100 py-2 fw-semibold shadow-sm d-flex align-items-center justify-content-center"
                          disabled={isSubmitting || loading}
                        >
                          {isSubmitting || loading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              Complete Registration <ArrowRight size={16} className="ms-2" />
                            </>
                          )}
                        </Button>

                        {/* Redirect to Login */}
                        <div className="text-center mt-4">
                          <p className="mb-0 text-muted small">
                            Already have an account?{' '}
                            <Link to="/login" className="text-decoration-none fw-semibold text-primary">
                              Sign in here
                            </Link>
                          </p>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;