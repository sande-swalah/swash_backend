const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('./user_controller');
const { verifyToken } = require('../validators/tokenization');

const router = express.Router();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    return next();
  };
}

router.post('/register', authMiddleware, requireRole('owner'), registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
