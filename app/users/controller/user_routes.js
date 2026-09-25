const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('./user_controller');
const { authMiddleware, requireRole } = require('../../common/middleware/auth');

const router = express.Router();

router.post('/register', authMiddleware, requireRole('owner'), registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
