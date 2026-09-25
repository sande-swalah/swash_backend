const { verifyToken } = require('../../users/validators/tokenization');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  try {
    req.user = verifyToken(authHeader.slice(7));
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return next();
  };
}

module.exports = { authMiddleware, requireRole };