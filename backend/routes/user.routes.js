const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfilePhoto
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

router.route('/:id/photo')
  .put(updateProfilePhoto);

module.exports = router;