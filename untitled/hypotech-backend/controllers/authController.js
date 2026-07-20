const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Name, email and password are required.',
        });

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );
    if (existing.length)
      return res
        .status(409)
        .json({ success: false, message: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, hash],
    );
    const userId = result.insertId;

    await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [
      userId,
    ]);
    await pool.query(
      "INSERT INTO sleep_schedules (user_id, sleep_time, wake_time) VALUES (?, '22:00:00', '06:00:00')",
      [userId],
    );

    const defaultApps = [
      ['Instagram', '📸', 'Social Media', 1, 'instagram.com'],
      ['YouTube', '▶️', 'Entertainment', 1, 'youtube.com'],
      ['Twitter / X', '🐦', 'Social Media', 1, 'twitter.com'],
      ['PUBG Mobile', '🎮', 'Gaming', 1, 'pubg.com'],
      ['Netflix', '🎬', 'Entertainment', 1, 'netflix.com'],
      ['WhatsApp', '💬', 'Messaging', 0, null],
      ['Snapchat', '👻', 'Social Media', 1, 'snapchat.com'],
      ['TikTok', '🎵', 'Entertainment', 1, 'tiktok.com'],
      ['Phone Dialer', '📞', 'Emergency', 0, null],
      ['Google Maps', '🗺️', 'Navigation', 0, 'maps.google.com'],
      ['Free Fire', '🔥', 'Gaming', 1, 'ff.garena.com'],
      ['Amazon Prime', '📺', 'Entertainment', 1, 'primevideo.com'],
    ];
    for (const [name, icon, category, blocked, domain] of defaultApps) {
      await pool.query(
        'INSERT INTO apps (user_id, name, icon, category, is_blocked, website_domain) VALUES (?,?,?,?,?,?)',
        [userId, name, icon, category, blocked, domain],
      );
    }

    const user = { id: userId, name, email };
    res
      .status(201)
      .json({
        success: true,
        message: 'Account created.',
        token: generateToken(user),
        user,
      });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: 'Email and password required.' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    if (!rows.length)
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials.' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials.' });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
    res.json({
      success: true,
      message: 'Login successful.',
      token: generateToken(userData),
      user: userData,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, age_group, created_at FROM users WHERE id = ?',
      [req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, age_group } = req.body;
    await pool.query(
      'UPDATE users SET name=?, phone=?, age_group=? WHERE id=?',
      [name, phone, age_group, req.user.id],
    );
    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Server error.', error: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
