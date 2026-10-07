// server.js
// This file starts our web server and connects everything together.

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// Lets our server understand data sent from HTML forms (like register/login)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions: this is how the server "remembers" a user is logged in
// as they move from page to page.
app.use(session({
  secret: 'ticketflux-secret-key', // used to securely sign the session
  resave: false,
  saveUninitialized: false
}));

// Serves our HTML/CSS/JS files from the "public" folder automatically.
// So public/login.html becomes available at http://localhost:3000/login.html
app.use(express.static(path.join(__dirname, 'public')));

// Our authentication routes (register, login, logout) live in routes/auth.js.
// We'll create that file next.
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

app.listen(PORT, () => {
  console.log(`TicketFlux server running at http://localhost:${PORT}`);
});