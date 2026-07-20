const { pool } = require('../config/db');

// GET /api/schedule
const getSchedule = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sleep_schedules WHERE user_id = ? LIMIT 1',
      [req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: 'No schedule found.' });

    const s = rows[0];
    res.json({
      success: true,
      schedule: {
        ...s,
        active_days: s.active_days.split(',').map(Number),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/schedule
const updateSchedule = async (req, res) => {
  try {
    const {
      sleep_time,
      wake_time,
      active_days,
      wind_down_enabled,
      wind_down_mins,
      bedtime_reminder,
      strict_mode,
      is_active,
    } = req.body;

    const daysStr = Array.isArray(active_days)
      ? active_days.join(',')
      : active_days;

    const [existing] = await pool.query(
      'SELECT id FROM sleep_schedules WHERE user_id = ?',
      [req.user.id],
    );

    if (existing.length) {
      await pool.query(
        `UPDATE sleep_schedules SET
          sleep_time=?, wake_time=?, active_days=?,
          wind_down_enabled=?, wind_down_mins=?,
          bedtime_reminder=?, strict_mode=?, is_active=?
         WHERE user_id=?`,
        [
          sleep_time,
          wake_time,
          daysStr,
          wind_down_enabled,
          wind_down_mins,
          bedtime_reminder,
          strict_mode,
          is_active,
          req.user.id,
        ],
      );
    } else {
      await pool.query(
        `INSERT INTO sleep_schedules
          (user_id, sleep_time, wake_time, active_days, wind_down_enabled, wind_down_mins, bedtime_reminder, strict_mode, is_active)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          req.user.id,
          sleep_time,
          wake_time,
          daysStr,
          wind_down_enabled,
          wind_down_mins,
          bedtime_reminder,
          strict_mode,
          is_active,
        ],
      );
    }
    res.json({ success: true, message: 'Schedule saved successfully.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

module.exports = { getSchedule, updateSchedule };
