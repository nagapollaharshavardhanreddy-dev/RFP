const express = require('express');
const router = express.Router();
const {
  getApps,
  toggleApp,
  blockAll,
  unblockAll,
  logBlockEvent,
  getBlockEvents,
} = require('../controllers/appsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getApps);
router.put('/block-all', protect, blockAll);
router.put('/unblock-all', protect, unblockAll);
router.put('/:id/toggle', protect, toggleApp);
router.post('/block-event', protect, logBlockEvent);
router.get('/block-events', protect, getBlockEvents);

module.exports = router;
