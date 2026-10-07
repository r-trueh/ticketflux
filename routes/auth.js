// routes/auth.js
// Handles registration, login, and logout.

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// POST /api/auth/register
// Creates a new account.
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation (matches FR-2 in the SRS)
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  if (!['attendee', 'organizer'].includes(role)) {
    return res.status(400).json({ error: 'Role must be attendee or organizer.' });
  }

  // Check if email is already used
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'That email is already registered.' });
  }

  // Scramble the password so it's never stored as plain text (FR-3)
  const password_hash = await bcrypt.hash(password, 10);

  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run(name, email, password_hash, role);

  res.json({ message: 'Account created successfully.', userId: result.lastInsertRowid });
});

// POST /api/auth/login
// Logs a user in and starts their session.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Save basic info in the session so other pages know who's logged in
  req.session.user = { id: user.id, name: user.name, role: user.role };

  res.json({ message: 'Logged in successfully.', user: req.session.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully.' });
  });
});

module.exports = router;