const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const prisma = require('../utils/prisma');
const { sendWelcomeEmail, sendPasswordReset } = require('../services/email');
const { auth } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const resetTokens = new Map(); // In-memory for simplicity; use Redis in prod

const sign = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── Register ─────────────────────────────────────────────
router.post('/register', limiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, password: hash, name } });
  sendWelcomeEmail(user);

  res.status(201).json({ token: sign(user.id), user: sanitize(user) });
});

// ── Login ─────────────────────────────────────────────────
router.post('/login', limiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.suspended) return res.status(403).json({ error: 'Account suspended' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: sign(user.id), user: sanitize(user) });
});

// ── Me ────────────────────────────────────────────────────
router.get('/me', auth, (req, res) => res.json({ user: sanitize(req.user) }));

// ── Google OAuth ──────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth` }),
  (req, res) => {
    const token = sign(req.user.id);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

// ── GitHub OAuth ──────────────────────────────────────────
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth` }),
  (req, res) => {
    const token = sign(req.user.id);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

// ── Forgot Password ───────────────────────────────────────
router.post('/forgot-password', limiter, async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, { userId: user.id, exp: Date.now() + 3600000 });
  sendPasswordReset(user, token);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// ── Reset Password ────────────────────────────────────────
router.post('/reset-password', limiter, async (req, res) => {
  const { token, password } = req.body;
  const data = resetTokens.get(token);
  if (!data || Date.now() > data.exp) return res.status(400).json({ error: 'Invalid or expired token' });

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: data.userId }, data: { password: hash } });
  resetTokens.delete(token);
  res.json({ message: 'Password reset successful' });
});

function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

module.exports = router;
