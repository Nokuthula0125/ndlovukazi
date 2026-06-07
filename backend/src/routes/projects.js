const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { auth, optionalAuth } = require('../middleware/auth');

// ── List approved projects ────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  const { page = 1, search, skills } = req.query;
  const skip = (Number(page) - 1) * 20;
  const where = {
    status: 'APPROVED',
    ...(search && { OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]}),
    ...(skills && { skills: { contains: skills, mode: 'insensitive' } }),
  };
  const [projects, total] = await Promise.all([
    prisma.project.findMany({ where, skip, take: 20, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatarUrl: true } } } }),
    prisma.project.count({ where }),
  ]);
  res.json({ projects, total, pages: Math.ceil(total / 20) });
});

// ── Get one project ───────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { name: true, avatarUrl: true } } },
  });
  if (!project || (project.status !== 'APPROVED' && req.user?.id !== project.userId && req.user?.role !== 'ADMIN')) {
    return res.status(404).json({ error: 'Project not found' });
  }
  let hasApplied = false;
  if (req.user) {
    const app = await prisma.application.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId: project.id } },
    });
    hasApplied = !!app;
  }
  res.json({ project, hasApplied });
});

// ── Create project ────────────────────────────────────────
router.post('/', auth, [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('skills').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { title, description, budget, skills, duration, deadline } = req.body;
  const project = await prisma.project.create({
    data: { userId: req.user.id, title, description, budget, skills, duration, deadline: deadline ? new Date(deadline) : null },
  });
  res.status(201).json({ project });
});

// ── Apply to project ──────────────────────────────────────
router.post('/:id/apply', auth, async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project || project.status !== 'APPROVED') return res.status(404).json({ error: 'Project not found' });
  if (project.userId === req.user.id) return res.status(400).json({ error: 'Cannot apply to your own project' });

  const existing = await prisma.application.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId: project.id } },
  });
  if (existing) return res.status(409).json({ error: 'Already applied' });

  const app = await prisma.application.create({
    data: { userId: req.user.id, projectId: project.id, message: req.body.message },
  });
  res.status(201).json({ application: app });
});

// ── User's own projects ───────────────────────────────────
router.get('/my/list', auth, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ projects });
});

// ── Edit project (pending only) ───────────────────────────
router.put('/:id', auth, async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project || project.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  if (project.status !== 'PENDING') return res.status(400).json({ error: 'Can only edit pending projects' });
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { title: req.body.title, description: req.body.description, budget: req.body.budget, skills: req.body.skills },
  });
  res.json({ project: updated });
});

// ── Delete project ────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project || (project.userId !== req.user.id && req.user.role !== 'ADMIN')) return res.status(403).json({ error: 'Forbidden' });
  await prisma.project.delete({ where: { id: project.id } });
  res.json({ message: 'Project deleted' });
});

module.exports = router;
