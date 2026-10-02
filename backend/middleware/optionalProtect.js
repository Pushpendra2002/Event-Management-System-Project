const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

module.exports = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Public request → continue
  if (!token) return next();

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_key'
    );

    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    // Invalid token → ignore and continue as public
  }

  next();
};
