const express = require('express');
const controller = require('./dashboard_controller');
const { authMiddleware, requireRole } = require('../../common/middleware/auth');

const router = express.Router();
router.use(authMiddleware, requireRole('owner'));
router.get('/', controller.summary);

module.exports = router;