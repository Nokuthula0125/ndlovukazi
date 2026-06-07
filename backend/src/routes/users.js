const router = require('express').Router();
const prisma = require('../utils/prisma');
const { auth } = require('../middleware/auth');

// ── Profile ───────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
  const { name, country, skills, experience, linkedinUrl, portfolioUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, country, skills, experience, linkedinUrl, portfolioUrl },
  });
  const { password, ...safe } = user;
  res.json({ user: safe });
});

// ── Saved jobs ────────────────────────────────────────────
router.get('/saved-jobs', auth, async (req, res) => {
  const saved = await prisma.savedJob.findMany({
    where: { userId: req.user.id },
    include: { job: { select: {
      id: true, title: true, company: true, location: true, salary: true,
      category: true, jobType: true, postedAt: true, logo: true, verified: true, expired: true,
    }}},
    orderBy: { createdAt: 'desc' },
  });
  res.json({ saved });
});

// ── Applications ──────────────────────────────────────────
router.get('/applications', auth, async (req, res) => {
  const apps = await prisma.application.findMany({
    where: { userId: req.user.id },
    include: { project: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ applications: apps });
});

// ── Dashboard stats ───────────────────────────────────────
router.get('/dashboard', auth, async (req, res) => {
  const [savedCount, appCount, alertCount, cvCount] = await Promise.all([
    prisma.savedJob.count({ where: { userId: req.user.id } }),
    prisma.application.count({ where: { userId: req.user.id } }),
    prisma.jobAlert.count({ where: { userId: req.user.id, active: true } }),
    prisma.cvUpload.count({ where: { userId: req.user.id } }),
  ]);
  res.json({ savedJobs: savedCount, applications: appCount, alerts: alertCount, cvUploads: cvCount });
});

module.exports = router;
