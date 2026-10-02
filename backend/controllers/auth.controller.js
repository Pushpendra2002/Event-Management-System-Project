const User = require('../models/User.model');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const registrationRole = ['user', 'organizer'].includes(role) ? role : 'user';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: registrationRole,
      phone: phone || ''
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Create new token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password (mock)
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with that email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent (mock implementation)'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password (mock)
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    // In a real app, you would verify the reset token
    // For now, we'll just accept the new password
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful (mock implementation)'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email (mock)
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    // In a real app, you would verify the token
    // For now, we'll just return success
    
    res.status(200).json({
      success: true,
      message: 'Email verified (mock implementation)'
    });
  } catch (err) {
    next(err);
  }
};
