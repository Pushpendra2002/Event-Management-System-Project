const User = require('../models/User.model');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this user'
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      address: req.body.address
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile photo
// @route   PUT /api/v1/users/:id/photo
// @access  Private
exports.updateProfilePhoto = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock photo update
    user.profilePhoto = 'https://via.placeholder.com/150';
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
