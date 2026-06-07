const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { sendContactEmail } = require('../services/email');

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

router.post('/', limiter, [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().isLength({ min: 10 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, message } = req.body;
  await prisma.contactMessage.create({ data: { name, email, message } });
  sendContactEmail({ name, email, message });
  res.json({ message: 'Message sent! We will get back to you soon.' });
});

module.exports = router;
