require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');

const { startCronJobs } = require('./jobs/cron');
require('./utils/passport');

const app = express();

// ── Security & middleware ──────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/jobs',     require('./routes/jobs'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/cv',       require('./routes/cv'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/blog',     require('./routes/blog'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/alerts',   require('./routes/alerts'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Ndlovukazi API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  startCronJobs();
});

module.exports = app;
