const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { auth, adminOnly } = require('../middleware/auth');
const cache = require('../utils/cache');

router.use(auth, adminOnly);

// ── Dashboard stats ───────────────────────────────────────
router.get('/stats', async (req, res) => {
  const [totalUsers, activeJobs, totalProjects, applications, flagged, blogPosts] = await Promise.all([
    prisma.user.count(),
    prisma.job.count({ where: { expired: false } }),
    prisma.project.count(),
    prisma.application.count(),
    prisma.flaggedJob.count({ where: { status: 'PENDING' } }),
    prisma.blogPost.count(),
  ]);
  const popularJobs = await prisma.job.findMany({
    where: { expired: false },
    orderBy: { views: 'desc' },
    take: 5,
    select: { id: true, title: true, company: true, views: true, clicks: true },
  });
  res.json({ totalUsers, activeJobs, totalProjects, applications, flagged, blogPosts, popularJobs });
});

// ── JOBS ──────────────────────────────────────────────────
router.get('/jobs', async (req, res) => {
  const { page = 1, search } = req.query;
  const skip = (Number(page) - 1) * 30;
  const where = search ? { OR: [
    { title: { contains: search, mode: 'insensitive' } },
    { company: { contains: search, mode: 'insensitive' } },
  ]} : {};
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, skip, take: 30, orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, company: true, category: true, jobType: true,
        verified: true, sponsored: true, expired: true, source: true, postedAt: true, views: true, clicks: true } }),
    prisma.job.count({ where }),
  ]);
  res.json({ jobs, total });
});

router.post('/jobs', [
  body('title').trim().notEmpty(),
  body('company').trim().notEmpty(),
  body('category').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const job = await prisma.job.create({
    data: { ...req.body, source: 'admin', verified: true },
  });
  cache.delByPrefix('jobs:');
  res.status(201).json({ job });
});

router.patch('/jobs/:id', async (req, res) => {
  const job = await prisma.job.update({ where: { id: req.params.id }, data: req.body });
  cache.delByPrefix('jobs:');
  res.json({ job });
});

router.delete('/jobs/:id', async (req, res) => {
  await prisma.job.delete({ where: { id: req.params.id } });
  cache.delByPrefix('jobs:');
  res.json({ message: 'Job deleted' });
});

// ── PROJECTS ──────────────────────────────────────────────
router.get('/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });
  res.json({ projects });
});

router.patch('/projects/:id', async (req, res) => {
  const project = await prisma.project.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  res.json({ project });
});

router.delete('/projects/:id', async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
});

// ── USERS ─────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, suspended: true, createdAt: true, country: true },
  });
  res.json({ users });
});

router.patch('/users/:id', async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
  const { password, ...safe } = user;
  res.json({ user: safe });
});

router.delete('/users/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

// ── FLAGGED JOBS ──────────────────────────────────────────
router.get('/flagged', async (req, res) => {
  const flagged = await prisma.flaggedJob.findMany({
    where: { status: 'PENDING' },
    include: {
      job: { select: { id: true, title: true, company: true, sourceUrl: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ flagged });
});

router.patch('/flagged/:id', async (req, res) => {
  const { status } = req.body; // SCAM or DISMISSED
  const flagged = await prisma.flaggedJob.update({ where: { id: req.params.id }, data: { status } });
  if (status === 'SCAM') {
    await prisma.job.update({ where: { id: flagged.jobId }, data: { expired: true } });
    cache.delByPrefix('jobs:');
  }
  res.json({ flagged });
});

// ── ATS KEYWORDS ─────────────────────────────────────────
router.get('/keywords', async (req, res) => {
  const keywords = await prisma.atsKeyword.findMany({ orderBy: { keyword: 'asc' } });
  res.json({ keywords });
});

router.post('/keywords', async (req, res) => {
  const kw = await prisma.atsKeyword.create({ data: { keyword: req.body.keyword, weight: req.body.weight || 1 } });
  res.status(201).json({ keyword: kw });
});

router.delete('/keywords/:id', async (req, res) => {
  await prisma.atsKeyword.delete({ where: { id: req.params.id } });
  res.json({ message: 'Keyword deleted' });
});

module.exports = router;
