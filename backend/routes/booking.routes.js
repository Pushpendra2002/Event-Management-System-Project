const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  updatePaymentStatus,
  cancelBooking,
  checkIn
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.route('/:id')
  .get(getBooking);

router.route('/:id/payment')
  .put(authorize('admin'), updatePaymentStatus);

router.route('/:id/cancel')
  .put(cancelBooking);

router.route('/:id/checkin')
  .put(authorize('organizer', 'admin'), checkIn);

module.exports = router;
