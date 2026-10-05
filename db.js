// db.js
// This file creates our database and all four tables it needs.

const Database = require('better-sqlite3');
const db = new Database('ticketflux.db');

// Turn on foreign keys, this makes sure, for example,
// a ticket can't point to an event that doesn't exist.
db.pragma('foreign_keys = ON');

// 1. USERS table: stores everyone who can log in
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('attendee', 'organizer', 'admin')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// 2. EVENTS table: stores events organizers create
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizer_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    venue TEXT NOT NULL,
    event_date TEXT NOT NULL,
    price REAL NOT NULL,
    capacity INTEGER NOT NULL,
    tickets_sold INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
  )
`);

// 3. ORDERS table: one row per booking (the "receipt")
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
  )
`);

// 4. TICKETS table: one row per individual ticket
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    ticket_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'valid' CHECK(status IN ('valid', 'used')),
    checked_in_at TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

console.log('Database ready: ticketflux.db with users, events, orders, tickets tables.');

module.exports = db;