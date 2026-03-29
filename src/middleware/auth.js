const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Country-based filtering middleware
exports.filterByCountry = (req, res, next) => {
  // Admin can access all countries
  if (req.user.role === 'Admin') {
    req.countryFilter = {};
  } else {
    // Manager and Member can only access their own country
    req.countryFilter = { country: req.user.country };
  }
  next();
};
