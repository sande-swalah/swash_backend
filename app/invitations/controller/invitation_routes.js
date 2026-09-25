const express = require('express');
const controller = require('./invitation_controller');
const { authMiddleware, requireRole } = require('../../common/middleware/auth');

const router = express.Router();
router.post('/accept', controller.accept);
router.post('/', authMiddleware, requireRole('owner'), controller.create);

module.exports = router;