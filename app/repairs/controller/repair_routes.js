const express = require('express');
const controller = require('./repair_controller');
const { authMiddleware, requireRole } = require('../../common/middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.get('/', requireRole('owner', 'employee', 'tenant'), controller.list);
router.post('/', requireRole('tenant'), controller.create);
router.patch('/:id', requireRole('owner'), controller.update);

module.exports = router;