const express = require('express');
const controller = require('./alert_controller');
const { authMiddleware } = require('../../common/middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.get('/', controller.list);
router.patch('/:id/read', controller.read);

module.exports = router;