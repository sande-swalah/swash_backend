const express = require('express');
const controller = require('./payment_controller');
const { authMiddleware, requireRole } = require('../../common/middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.get('/', requireRole('owner', 'tenant'), controller.list);
router.post('/', requireRole('tenant'), controller.create);

module.exports = router;