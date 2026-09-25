const express = require('express');
const controller = require('./rental_controller');
const { authMiddleware, requireRole } = require('../../common/middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.get('/', requireRole('owner'), controller.list);
router.post('/', requireRole('owner'), controller.create);
router.get('/:id', requireRole('owner'), controller.get);
router.post('/assign-tenant', requireRole('owner'), controller.assign);

module.exports = router;