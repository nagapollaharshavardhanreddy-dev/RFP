const express = require('express');
const router = express.Router();

const {
  getSchedule,
  updateSchedule,
} = require('../controllers/scheduleController');

const { protect } = require('../middleware/auth');

router.get('/', protect, getSchedule);
router.put('/', protect, updateSchedule);


router.post('/', (req, res) => {
  res.json({
    success: true,
    message: "Sleep schedule saved successfully"
  });
});

module.exports = router;