const { pool } = require('../config/db');

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: 'Settings not found.' });
    res.json({ success: true, settings: rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const {
      notif_enabled,
      sound_enabled,
      auto_report,
      pin_protection,
      cloud_sync,
      dark_mode,
      sleep_target_hours,
      wake_flexibility_min,
    } = req.body;

    await pool.query(
      `INSERT INTO user_settings
        (user_id, notif_enabled, sound_enabled, auto_report, pin_protection, cloud_sync, dark_mode, sleep_target_hours, wake_flexibility_min)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
        notif_enabled=VALUES(notif_enabled), sound_enabled=VALUES(sound_enabled),
        auto_report=VALUES(auto_report), pin_protection=VALUES(pin_protection),
        cloud_sync=VALUES(cloud_sync), dark_mode=VALUES(dark_mode),
        sleep_target_hours=VALUES(sleep_target_hours), wake_flexibility_min=VALUES(wake_flexibility_min)`,
      [
        req.user.id,
        notif_enabled,
        sound_enabled,
        auto_report,
        pin_protection,
        cloud_sync,
        dark_mode,
        sleep_target_hours,
        wake_flexibility_min,
      ],
    );
    res.json({ success: true, message: 'Settings saved.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// POST /api/settings/emergency-override
const logEmergencyOverride = async (req, res) => {
  try {
    const { duration_min, reason } = req.body;
    await pool.query(
      'INSERT INTO emergency_overrides (user_id, duration_min, reason) VALUES (?,?,?)',
      [
        req.user.id,
        duration_min || 15,
        reason || 'Emergency override triggered',
      ],
    );
    res.status(201).json({ success: true, message: 'Override logged.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/settings/data  (delete all sleep data)
const deleteUserData = async (req, res) => {
  try {
    await pool.query('DELETE FROM sleep_logs    WHERE user_id = ?', [
      req.user.id,
    ]);
    await pool.query('DELETE FROM block_events  WHERE user_id = ?', [
      req.user.id,
    ]);
    await pool.query('DELETE FROM emergency_overrides WHERE user_id = ?', [
      req.user.id,
    ]);
    res.json({ success: true, message: 'All sleep data deleted.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  logEmergencyOverride,
  deleteUserData,
};
