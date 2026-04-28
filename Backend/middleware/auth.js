const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    const err = new Error('No token, authorization denied');
    err.statusCode = 401;
    return next(err);
  }

  try {
    // Extract token from "Bearer <token>"
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    const error = new Error('Token is not valid');
    error.statusCode = 401;
    next(error);
  }
};
