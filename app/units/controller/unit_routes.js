const express = require('express');
const controller = require('./unit_controller');
const { authMiddleware, requireRole } = require('../../common/middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.get('/mine', requireRole('tenant'), controller.mine);
router.post('/', requireRole('owner'), controller.create);
router.get('/property/:propertyId', requireRole('owner'), controller.list);

module.exports = router;