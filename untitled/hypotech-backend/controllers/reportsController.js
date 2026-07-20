const { pool } = require('../config/db');

// GET /api/reports/weekly
const getWeeklyReport = async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT log_date, total_hours, quality_score, apps_blocked
       FROM sleep_logs
       WHERE user_id = ?
         AND log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY log_date ASC`,
      [req.user.id],
    );

    const [blockStats] = await pool.query(
      `SELECT a.name, a.icon, COUNT(be.id) AS total_blocks
       FROM block_events be
       JOIN apps a ON a.id = be.app_id
       WHERE be.user_id = ?
         AND be.blocked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY a.id
       ORDER BY total_blocks DESC
       LIMIT 6`,
      [req.user.id],
    );

    const avgSleep = logs.length
      ? (
          logs.reduce((s, l) => s + parseFloat(l.total_hours || 0), 0) /
          logs.length
        ).toFixed(1)
      : 0;
    const avgQuality = logs.length
      ? Math.round(
          logs.reduce((s, l) => s + (l.quality_score || 0), 0) / logs.length,
        )
      : 0;
    const totalBlocks = logs.reduce((s, l) => s + (l.apps_blocked || 0), 0);

    res.json({
      success: true,
      summary: {
        avgSleep,
        avgQuality,
        totalBlocks,
        nightsTracked: logs.length,
      },
      daily: logs,
      appBlockStats: blockStats,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/reports/dashboard
const getDashboard = async (req, res) => {
  try {
    const [todayLog] = await pool.query(
      'SELECT * FROM sleep_logs WHERE user_id = ? AND log_date = CURDATE()',
      [req.user.id],
    );

    const [streak] = await pool.query(
      `SELECT COUNT(*) AS streak_days
       FROM sleep_logs
       WHERE user_id = ?
         AND quality_score >= 70
         AND log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [req.user.id],
    );

    const [lastNightBlocks] = await pool.query(
      `SELECT a.name, a.icon, COUNT(be.id) AS attempts, MAX(be.blocked_at) AS last_blocked
       FROM block_events be
       JOIN apps a ON a.id = be.app_id
       WHERE be.user_id = ?
         AND DATE(be.blocked_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
       GROUP BY a.id
       ORDER BY attempts DESC`,
      [req.user.id],
    );

    const [schedule] = await pool.query(
      'SELECT sleep_time, wake_time, is_active FROM sleep_schedules WHERE user_id = ? LIMIT 1',
      [req.user.id],
    );

    res.json({
      success: true,
      todaySleep: todayLog[0] || null,
      streak: streak[0].streak_days,
      lastNightBlocks,
      schedule: schedule[0] || null,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// POST /api/reports/log
const createSleepLog = async (req, res) => {
  try {
    const {
      log_date,
      planned_sleep,
      planned_wake,
      actual_sleep,
      actual_wake,
      total_hours,
      quality_score,
      apps_blocked,
      notes,
    } = req.body;

    await pool.query(
      `INSERT INTO sleep_logs
        (user_id, log_date, planned_sleep, planned_wake, actual_sleep, actual_wake,
         total_hours, quality_score, apps_blocked, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
        actual_sleep=VALUES(actual_sleep), actual_wake=VALUES(actual_wake),
        total_hours=VALUES(total_hours), quality_score=VALUES(quality_score),
        apps_blocked=VALUES(apps_blocked), notes=VALUES(notes)`,
      [
        req.user.id,
        log_date,
        planned_sleep,
        planned_wake,
        actual_sleep,
        actual_wake,
        total_hours,
        quality_score,
        apps_blocked,
        notes,
      ],
    );

    res.status(201).json({ success: true, message: 'Sleep log saved.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

module.exports = { getWeeklyReport, getDashboard, createSleepLog };
