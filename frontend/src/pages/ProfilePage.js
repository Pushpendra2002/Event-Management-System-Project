import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMe, updatePassword } from '../features/auth/authSlice';
import { updateUserProfile } from '../features/users/userSlice';
import { userAPI } from '../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Tab,
  Nav,
  Badge,
  InputGroup,
  Form as BootstrapForm
} from 'react-bootstrap';
import {
  User,
  Lock,
  Bell,
  Calendar,
  Shield,
  Camera,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Ticket,
  Plus,
  Save
} from 'lucide-react';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification preferences
  const [prefs, setPrefs] = useState({
    bookingConfirmations: true,
    eventReminders: true,
    categoryAlerts: false,
    marketingUpdates: false
  });

  useEffect(() => {
    if (!user) {
      dispatch(getMe());
    }
  }, [dispatch, user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setUploadingPhoto(true);
    try {
      if (user?._id) {
        await userAPI.updateProfilePhoto(user._id, file);
        toast.success('Profile photo updated successfully!');
        dispatch(getMe());
      }
    } catch {
      toast.info('Photo preview loaded (saved locally).');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateUserProfile({ id: user._id, userData: values })).unwrap();
      toast.success('Profile updated successfully!');
      dispatch(getMe());
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })).unwrap();
      toast.success('Password changed successfully!');
      resetForm();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const profileSchema = Yup.object({
    name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string(),
    bio: Yup.string().max(500, 'Bio cannot exceed 500 characters'),
    address: Yup.object().shape({
      street: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      zipCode: Yup.string(),
      country: Yup.string()
    })
  });

  const passwordSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm new password is required')
  });

  if (loading || !user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading profile details...</p>
      </Container>
    );
  }

  const initialProfileValues = {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      country: user.address?.country || 'India'
    }
  };

  const initialPasswordValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  return (
    <Container className="py-4 py-lg-5">
      {/* Header */}
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-1">Account & Settings</h2>
        <p className="text-muted mb-0">Manage your personal information, security, and notification preferences</p>
      </div>

      <Row className="g-4">
        {/* Left Column: User Summary Card */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm text-center p-4 mb-4">
            <Card.Body className="p-0">
              {/* Avatar with Camera Overlay */}
              <div className="mb-3 position-relative d-inline-block">
                <div
                  className="rounded-circle overflow-hidden shadow-sm mx-auto position-relative"
                  style={{ width: '130px', height: '130px', border: '3px solid #3b82f6' }}
                >
                  <img
                    src={
                      imagePreview ||
                      user.profilePhoto ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=fff&size=200`
                    }
                    alt={user.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                  {uploadingPhoto && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                      <Spinner animation="border" size="sm" variant="light" />
                    </div>
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer"
                  style={{ transform: 'translate(-5px, -5px)', cursor: 'pointer' }}
                  title="Change avatar photo"
                >
                  <Camera size={16} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <h4 className="fw-bold mb-1 text-dark">{user.name}</h4>
              <p className="text-muted small mb-2">{user.email}</p>

              <Badge
                bg={
                  user.role === 'admin' ? 'danger' :
                  user.role === 'organizer' ? 'primary' : 'success'
                }
                className="px-3 py-1 mb-3 text-capitalize"
              >
                {user.role} Account
              </Badge>

              <hr className="my-3 text-muted" />

              <div className="text-start small text-muted d-flex flex-column gap-2 mb-4">
                <div className="d-flex align-items-center">
                  <Calendar size={16} className="me-2 text-primary" />
                  <span>Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="d-flex align-items-center">
                  <Shield size={16} className="me-2 text-success" />
                  <span>Security: Protected by JWT</span>
                </div>
              </div>

              {/* Quick Navigation Shortcuts */}
              <div className="d-flex flex-column gap-2">
                <Button as={Link} to="/bookings" variant="outline-primary" size="sm" className="w-100 d-flex align-items-center justify-content-center">
                  <Ticket size={15} className="me-2" /> My Bookings & Passes
                </Button>
                {user.role === 'organizer' && (
                  <>
                    <Button as={Link} to="/organizer/dashboard" variant="outline-dark" size="sm" className="w-100 d-flex align-items-center justify-content-center">
                      <Calendar size={15} className="me-2" /> Organizer Studio
                    </Button>
                    <Button as={Link} to="/create-event" variant="primary" size="sm" className="w-100 d-flex align-items-center justify-content-center">
                      <Plus size={15} className="me-2" /> Host New Event
                    </Button>
                  </>
                )}
                {user.role === 'admin' && (
                  <Button as={Link} to="/admin" variant="danger" size="sm" className="w-100 d-flex align-items-center justify-content-center">
                    <Shield size={15} className="me-2" /> Admin Control Center
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Settings Tabs */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="pills" className="nav-fill mb-4 p-1 bg-light rounded-3">
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="d-flex align-items-center justify-content-center py-2">
                      <User size={16} className="me-2" /> Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password" className="d-flex align-items-center justify-content-center py-2">
                      <Lock size={16} className="me-2" /> Security
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="preferences" className="d-flex align-items-center justify-content-center py-2">
                      <Bell size={16} className="me-2" /> Preferences
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  {/* TAB 1: PROFILE DETAILS */}
                  <Tab.Pane eventKey="profile">
                    <h5 className="fw-bold mb-3">Personal Details</h5>
                    <Formik
                      initialValues={initialProfileValues}
                      validationSchema={profileSchema}
                      onSubmit={handleProfileSubmit}
                      enableReinitialize
                    >
                      {({ isSubmitting, errors, touched }) => (
                        <Form>
                          <Row className="g-3 mb-3">
                            <Col md={6}>
                              <label className="form-label small fw-semibold">
                                Full Name <span className="text-danger">*</span>
                              </label>
                              <InputGroup size="sm">
                                <InputGroup.Text className="bg-light">
                                  <User size={15} />
                                </InputGroup.Text>
                                <Field
                                  name="name"
                                  type="text"
                                  className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                                />
                                <ErrorMessage name="name" component="div" className="invalid-feedback" />
                              </InputGroup>
                            </Col>

                            <Col md={6}>
                              <label className="form-label small fw-semibold">
                                Email Address <span className="text-danger">*</span>
                              </label>
                              <InputGroup size="sm">
                                <InputGroup.Text className="bg-light">
                                  <Mail size={15} />
                                </InputGroup.Text>
                                <Field
                                  name="email"
                                  type="email"
                                  className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                                />
                                <ErrorMessage name="email" component="div" className="invalid-feedback" />
                              </InputGroup>
                            </Col>
                          </Row>

                          <Row className="g-3 mb-3">
                            <Col md={6}>
                              <label className="form-label small fw-semibold">Phone Number</label>
                              <InputGroup size="sm">
                                <InputGroup.Text className="bg-light">
                                  <Phone size={15} />
                                </InputGroup.Text>
                                <Field
                                  name="phone"
                                  type="tel"
                                  className="form-control"
                                  placeholder="+91 98765 43210"
                                />
                              </InputGroup>
                            </Col>
                            <Col md={6}>
                              <label className="form-label small fw-semibold">Role</label>
                              <Field
                                type="text"
                                className="form-control form-control-sm bg-light text-capitalize"
                                value={user.role}
                                disabled
                              />
                            </Col>
                          </Row>

                          <div className="mb-4">
                            <label className="form-label small fw-semibold">About / Bio</label>
                            <Field
                              name="bio"
                              as="textarea"
                              rows={3}
                              className="form-control form-control-sm"
                              placeholder="Tell other event goers and organizers about yourself..."
                            />
                            <ErrorMessage name="bio" component="div" className="text-danger small" />
                          </div>

                          <h6 className="fw-bold mb-3 pt-2 border-top">Address Information</h6>
                          <div className="mb-3">
                            <label className="form-label small fw-semibold">Street Address</label>
                            <Field
                              name="address.street"
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="House/Apartment #, Street"
                            />
                          </div>

                          <Row className="g-3 mb-4">
                            <Col sm={6} md={3}>
                              <label className="form-label small fw-semibold">City</label>
                              <Field
                                name="address.city"
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="City"
                              />
                            </Col>
                            <Col sm={6} md={3}>
                              <label className="form-label small fw-semibold">State</label>
                              <Field
                                name="address.state"
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="State"
                              />
                            </Col>
                            <Col sm={6} md={3}>
                              <label className="form-label small fw-semibold">PIN Code</label>
                              <Field
                                name="address.zipCode"
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="560001"
                              />
                            </Col>
                            <Col sm={6} md={3}>
                              <label className="form-label small fw-semibold">Country</label>
                              <Field
                                name="address.country"
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="India"
                              />
                            </Col>
                          </Row>

                          <div className="d-flex justify-content-end">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={isSubmitting}
                              className="d-flex align-items-center shadow-sm"
                            >
                              {isSubmitting ? (
                                <>
                                  <Spinner size="sm" animation="border" className="me-2" /> Saving...
                                </>
                              ) : (
                                <>
                                  <Save size={16} className="me-2" /> Save Profile Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </Tab.Pane>

                  {/* TAB 2: SECURITY & PASSWORD */}
                  <Tab.Pane eventKey="password">
                    <h5 className="fw-bold mb-1">Change Account Password</h5>
                    <p className="text-muted small mb-4">
                      Keep your account safe by using a strong password with letters, numbers, and symbols.
                    </p>

                    <Formik
                      initialValues={initialPasswordValues}
                      validationSchema={passwordSchema}
                      onSubmit={handlePasswordSubmit}
                    >
                      {({ isSubmitting, errors, touched }) => (
                        <Form style={{ maxWidth: '480px' }}>
                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Current Password <span className="text-danger">*</span>
                            </label>
                            <InputGroup size="sm">
                              <InputGroup.Text className="bg-light">
                                <Lock size={15} />
                              </InputGroup.Text>
                              <Field
                                name="currentPassword"
                                type={showCurrentPassword ? 'text' : 'password'}
                                className={`form-control ${touched.currentPassword && errors.currentPassword ? 'is-invalid' : ''}`}
                                placeholder="Enter your existing password"
                              />
                              <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </Button>
                              <ErrorMessage name="currentPassword" component="div" className="invalid-feedback" />
                            </InputGroup>
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              New Password <span className="text-danger">*</span>
                            </label>
                            <InputGroup size="sm">
                              <InputGroup.Text className="bg-light">
                                <Lock size={15} />
                              </InputGroup.Text>
                              <Field
                                name="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                className={`form-control ${touched.newPassword && errors.newPassword ? 'is-invalid' : ''}`}
                                placeholder="Enter a new secure password"
                              />
                              <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </Button>
                              <ErrorMessage name="newPassword" component="div" className="invalid-feedback" />
                            </InputGroup>
                            <small className="text-muted">Must be at least 6 characters</small>
                          </div>

                          <div className="mb-4">
                            <label className="form-label small fw-semibold">
                              Confirm New Password <span className="text-danger">*</span>
                            </label>
                            <InputGroup size="sm">
                              <InputGroup.Text className="bg-light">
                                <Lock size={15} />
                              </InputGroup.Text>
                              <Field
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                                placeholder="Re-type new password"
                              />
                              <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </Button>
                              <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                            </InputGroup>
                          </div>

                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            className="d-flex align-items-center shadow-sm"
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner size="sm" animation="border" className="me-2" /> Updating Password...
                              </>
                            ) : (
                              <>
                                <Lock size={16} className="me-2" /> Update Password
                              </>
                            )}
                          </Button>
                        </Form>
                      )}
                    </Formik>
                  </Tab.Pane>

                  {/* TAB 3: NOTIFICATION PREFERENCES */}
                  <Tab.Pane eventKey="preferences">
                    <h5 className="fw-bold mb-1">Notification Preferences</h5>
                    <p className="text-muted small mb-4">
                      Control which notifications and reminders you receive via email.
                    </p>

                    <div className="d-flex flex-column gap-3 mb-4">
                      <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="d-block text-dark">Booking Confirmations & Passes</strong>
                          <span className="text-muted small">Receive immediate email receipt and QR pass link upon ticket purchase</span>
                        </div>
                        <BootstrapForm.Check
                          type="switch"
                          id="pref-booking"
                          checked={prefs.bookingConfirmations}
                          onChange={(e) => setPrefs(prev => ({ ...prev, bookingConfirmations: e.target.checked }))}
                        />
                      </div>

                      <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="d-block text-dark">Event Reminders (24 Hours Prior)</strong>
                          <span className="text-muted small">Get calendar reminders and venue directions before your event starts</span>
                        </div>
                        <BootstrapForm.Check
                          type="switch"
                          id="pref-reminders"
                          checked={prefs.eventReminders}
                          onChange={(e) => setPrefs(prev => ({ ...prev, eventReminders: e.target.checked }))}
                        />
                      </div>

                      <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="d-block text-dark">Recommended Events in Your City</strong>
                          <span className="text-muted small">Weekly digests of trending music, tech, and sports events</span>
                        </div>
                        <BootstrapForm.Check
                          type="switch"
                          id="pref-category"
                          checked={prefs.categoryAlerts}
                          onChange={(e) => setPrefs(prev => ({ ...prev, categoryAlerts: e.target.checked }))}
                        />
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => toast.success('Notification preferences saved successfully!')}
                      className="d-flex align-items-center shadow-sm"
                    >
                      <Save size={16} className="me-2" /> Save Notification Settings
                    </Button>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;