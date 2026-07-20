const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  logEmergencyOverride,
  deleteUserData,
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);
router.post('/emergency-override', protect, logEmergencyOverride);
router.delete('/data', protect, deleteUserData);

module.exports = router;
