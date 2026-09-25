const express = require('express');
const controller = require('./bill_controller');
const { authMiddleware, requireRole } = require('../../common/middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.get('/', requireRole('owner', 'employee', 'tenant'), controller.list);
router.post('/', requireRole('owner', 'employee'), controller.create);

module.exports = router;