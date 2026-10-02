const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  getMyEvents,
  getFeaturedEvents,
  getEventsByCategory,
  getPlatformStats
} = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const optionalProtect = require('../middleware/optionalProtect');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// router.route('/')
//   .get(getEvents)
//   .post(protect, authorize('organizer', 'admin'), createEvent);

router.route('/')
  .get(optionalProtect, getEvents)
  .post(protect, authorize('organizer', 'admin'), createEvent);
  
router.route('/featured')
  .get(getFeaturedEvents);

router.route('/stats')
  .get(getPlatformStats);

router.route('/category/:category')
  .get(getEventsByCategory);

router.route('/organizer/me')
  .get(protect, authorize('organizer', 'admin'), getMyEvents);

router.route('/:id')
  .get(optionalProtect, getEvent)
  .put(protect, authorize('organizer', 'admin'), updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

router.route('/:id/images')
  .post(protect, authorize('organizer', 'admin'), upload.single('image'), uploadEventImage);

module.exports = router;
