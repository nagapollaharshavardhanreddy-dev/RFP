const express = require('express');
const router = express.Router();
const {
  getWeeklyReport,
  getDashboard,
  createSleepLog,
} = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');

router.get('/weekly', protect, getWeeklyReport);
router.get('/dashboard', protect, getDashboard);
router.post('/log', protect, createSleepLog);

module.exports = router;
