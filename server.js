// Load environment variables first — must be at the very top
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

const connectDB = require('./config/db');
const reservationRoutes = require('./routes/reservations');
const contactRoutes = require('./routes/contacts');
const menuRoutes = require('./routes/menu');

// ─── Create Express App ─────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────────────────

// Enable CORS for all origins (tighten in production)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Session middleware for admin authentication
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/reservations', reservationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/menu', menuRoutes);

// ─── Admin Auth Routes (inline) ─────────────────────────────────────────────

/**
 * POST /api/admin/login
 * Authenticate admin using credentials from environment variables.
 */
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate against environment credentials
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      return res.json({
        success: true,
        message: 'Login successful. Welcome, Admin!'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid username or password.'
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

/**
 * POST /api/admin/logout
 * Destroy the current admin session.
 */
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Logout failed.'
      });
    }

    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
});

/**
 * GET /api/admin/check
 * Check whether the current session is authenticated.
 */
app.get('/api/admin/check', (req, res) => {
  return res.json({
    success: true,
    isAdmin: req.session && req.session.isAdmin === true
  });
});

// ─── Catch-All: Serve index.html for SPA routing ────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌿 Food Garden server is running!`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api\n`);
  });
});
