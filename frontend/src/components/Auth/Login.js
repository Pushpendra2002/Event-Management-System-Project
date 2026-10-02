import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../features/auth/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Alert, Spinner, Button, InputGroup } from 'react-bootstrap';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Calendar,
  Ticket,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const initialValues = {
    email: '',
    password: '',
    remember: false
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email address is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(login({ email: values.email, password: values.password })).unwrap();
    } catch {
      // Error handled by redux slice
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={9}>
            <Card className="border-0 shadow-lg overflow-hidden rounded-4">
              <Row className="g-0">
                {/* Left Side: Brand & Feature Showcase */}
                <Col
                  lg={5}
                  className="d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative"
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)'
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-white bg-opacity-20 rounded-circle p-2">
                        <Sparkles size={22} className="text-warning" />
                      </div>
                      <span className="fw-bold fs-5 tracking-tight">EventPulse</span>
                    </div>

                    <h3 className="fw-bold mb-3 text-white">
                      Your Gateway to Extraordinary Experiences
                    </h3>
                    <p className="text-white-50 small mb-4">
                      Discover concerts, tech summits, networking meetups, and sports events happening around you.
                    </p>

                    <div className="d-flex flex-column gap-3 mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-15 rounded-circle p-2">
                          <Ticket size={18} className="text-white" />
                        </div>
                        <div className="small">
                          <strong className="d-block text-white">Digital QR Boarding Passes</strong>
                          <span className="text-white-50">Instant pass generation for entry</span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-15 rounded-circle p-2">
                          <Calendar size={18} className="text-white" />
                        </div>
                        <div className="small">
                          <strong className="d-block text-white">Live Event Tracking</strong>
                          <span className="text-white-50">Real-time attendance & schedule alerts</span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-15 rounded-circle p-2">
                          <ShieldCheck size={18} className="text-white" />
                        </div>
                        <div className="small">
                          <strong className="d-block text-white">Secure INR (₹) Payments</strong>
                          <span className="text-white-50">100% verified ticket check-ins</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-10">
                    <p className="small text-white fst-italic mb-1">
                      "Booking tickets was instant and the QR code pass worked smoothly at venue gates."
                    </p>
                    <span className="small text-white-50 fw-semibold">— Priya S., Bengaluru</span>
                  </div>
                </Col>

                {/* Right Side: Login Form */}
                <Col lg={7} className="p-4 p-md-5 bg-white">
                  <div className="text-center text-lg-start mb-4">
                    <h2 className="fw-bold text-dark mb-1">Welcome Back</h2>
                    <p className="text-muted small">
                      Please enter your credentials to access your account.
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
                    {({ isSubmitting, errors, touched }) => (
                      <Form>
                        {/* Email Field */}
                        <div className="mb-3">
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
                        </div>

                        {/* Password Field */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <label htmlFor="password" className="form-label fw-semibold small mb-0">
                              Password <span className="text-danger">*</span>
                            </label>
                            <Link
                              to="/forgot-password"
                              className="text-decoration-none small text-primary"
                            >
                              Forgot password?
                            </Link>
                          </div>
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
                              placeholder="Enter your password"
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
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="form-check">
                            <Field
                              type="checkbox"
                              name="remember"
                              id="remember"
                              className="form-check-input"
                            />
                            <label htmlFor="remember" className="form-check-label small text-muted">
                              Remember this device
                            </label>
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
                              Signing in...
                            </>
                          ) : (
                            <>
                              Sign In <ArrowRight size={16} className="ms-2" />
                            </>
                          )}
                        </Button>

                        {/* Sign Up Redirect */}
                        <div className="text-center mt-4">
                          <p className="mb-0 text-muted small">
                            Don't have an account yet?{' '}
                            <Link to="/register" className="text-decoration-none fw-semibold text-primary">
                              Create an account
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

export default Login;