const { pool } = require('../config/db');

// GET /api/apps
const getApps = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM apps WHERE user_id = ? ORDER BY category, name',
      [req.user.id],
    );
    res.json({ success: true, apps: rows });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/apps/:id/toggle
const toggleApp = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM apps WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: 'App not found.' });

    const newStatus = rows[0].is_blocked ? 0 : 1;
    await pool.query('UPDATE apps SET is_blocked = ? WHERE id = ?', [
      newStatus,
      req.params.id,
    ]);
    res.json({
      success: true,
      message: `App ${newStatus ? 'blocked' : 'allowed'}.`,
      is_blocked: newStatus,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/apps/block-all
const blockAll = async (req, res) => {
  try {
    await pool.query(
      "UPDATE apps SET is_blocked = 1 WHERE user_id = ? AND category != 'Emergency'",
      [req.user.id],
    );
    res.json({ success: true, message: 'All non-emergency apps blocked.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/apps/unblock-all
const unblockAll = async (req, res) => {
  try {
    await pool.query('UPDATE apps SET is_blocked = 0 WHERE user_id = ?', [
      req.user.id,
    ]);
    res.json({ success: true, message: 'All apps allowed.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// POST /api/apps/block-event  (log a block attempt)
const logBlockEvent = async (req, res) => {
  try {
    const { app_id } = req.body;
    await pool.query(
      'INSERT INTO block_events (user_id, app_id) VALUES (?, ?)',
      [req.user.id, app_id],
    );
    res.status(201).json({ success: true, message: 'Block event logged.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/apps/block-events  (last night's blocks)
const getBlockEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT be.id, a.name, a.icon, a.category, be.blocked_at
       FROM block_events be
       JOIN apps a ON a.id = be.app_id
       WHERE be.user_id = ?
         AND be.blocked_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY be.blocked_at DESC`,
      [req.user.id],
    );
    res.json({ success: true, events: rows });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

module.exports = {
  getApps,
  toggleApp,
  blockAll,
  unblockAll,
  logBlockEvent,
  getBlockEvents,
};
