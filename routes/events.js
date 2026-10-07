// routes/events.js
// Handles listing, viewing, and creating events.
const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/events
// Lists all upcoming events. Supports optional ?search= and ?category= query params.
router.get('/', (req, res) => {
  let sql = "SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC";
  const params = [];

  if (req.query.search) {
    sql += ' AND title LIKE ?';
    params.push(`%${req.query.search}%`);
  }

  if (req.query.category) {
    sql += ' AND category = ?';
    params.push(req.query.category);
  }

  const events = db.prepare(sql).all(...params);
  res.json(events);
});

// GET /api/events/:id
// Returns a single event by its ID.
router.get('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  res.json(event);
});

// POST /api/events
// Creates a new event. Only organizers can do this.
router.post('/', (req, res) => {
  // Check if user is logged in and is an organizer
  if (!req.session.user || req.session.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only organizers can create events.' });
  }

  const { title, description, category, venue, event_date, price, capacity } = req.body;

  // Basic validation
  if (!title || !venue || !event_date || !price || !capacity) {
    return res.status(400).json({ error: 'Title, venue, date, price, and capacity are required.' });
  }

  if (Number(price) <= 0) {
    return res.status(400).json({ error: 'Price must be greater than 0.' });
  }

  if (Number(capacity) <= 0) {
    return res.status(400).json({ error: 'Capacity must be greater than 0.' });
  }

  const result = db.prepare(
    'INSERT INTO events (organizer_id, title, description, category, venue, event_date, price, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.session.user.id, title, description || '', category || '', venue, event_date, Number(price), Number(capacity));

  res.status(201).json({ message: 'Event created successfully.', eventId: result.lastInsertRowid });
});

module.exports = router;