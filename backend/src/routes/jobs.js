const router = require('express').Router();
const axios = require('axios');
const prisma = require('../utils/prisma');
const cache = require('../utils/cache');
const { auth, optionalAuth } = require('../middleware/auth');
const { sendFlagNotification } = require('../services/email');

// ── List jobs ─────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  const { page = 1, limit = 20, category, jobType, region, search, sort = 'newest', fresh } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const cacheKey = `jobs:${JSON.stringify(req.query)}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const where = {
    expired: false,
    ...(category && { category }),
    ...(jobType && { jobType }),
    ...(region && region !== 'Worldwide' && { location: { contains: region } }),
    ...(fresh === 'true' && { postedAt: { gte: fortyEightHoursAgo } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const orderBy =
    sort === 'salary' ? [{ sponsored: 'desc' }, { salary: 'desc' }] :
    sort === 'company' ? [{ sponsored: 'desc' }, { company: 'asc' }] :
    [{ sponsored: 'desc' }, { postedAt: 'desc' }];

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, orderBy, skip, take: Number(limit), select: {
      id: true, title: true, company: true, location: true, salary: true,
      category: true, jobType: true, postedAt: true, logo: true, tags: true,
      verified: true, sponsored: true, source: true,
    }}),
    prisma.job.count({ where }),
  ]);

  const result = { jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  cache.set(cacheKey, result, 3600);
  res.json(result);
});

// ── Single job ────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job || job.expired) return res.status(404).json({ error: 'Job not found' });

  prisma.job.update({ where: { id: job.id }, data: { views: { increment: 1 } } }).catch(() => {});

  let isSaved = false;
  if (req.user) {
    const saved = await prisma.savedJob.findUnique({ where: { userId_jobId: { userId: req.user.id, jobId: job.id } } });
    isSaved = !!saved;
  }
  res.json({ job, isSaved });
});

// ── Track apply click ─────────────────────────────────────
router.post('/:id/click', async (req, res) => {
  prisma.job.update({ where: { id: req.params.id }, data: { clicks: { increment: 1 } } }).catch(() => {});
  res.json({ ok: true });
});

// ── Save / unsave ─────────────────────────────────────────
router.post('/:id/save', auth, async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;
  const existing = await prisma.savedJob.findUnique({ where: { userId_jobId: { userId, jobId } } });
  if (existing) {
    await prisma.savedJob.delete({ where: { userId_jobId: { userId, jobId } } });
    return res.json({ saved: false });
  }
  await prisma.savedJob.create({ data: { userId, jobId } });
  res.json({ saved: true });
});

// ── Flag job ──────────────────────────────────────────────
router.post('/:id/flag', auth, async (req, res) => {
  const { reason } = req.body;
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: 'Job not found' });

  await prisma.flaggedJob.create({ data: { userId: req.user.id, jobId: job.id, reason } });
  sendFlagNotification(job, reason);
  res.json({ message: 'Job reported. Thank you for keeping the platform safe.' });
});

// ── AI Cover Letter ───────────────────────────────────────
router.post('/:id/cover-letter', auth, async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const { userName, userBackground } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    return res.json({ coverLetter: fallbackTemplate(job, userName), fallback: true });
  }

  try {
    const prompt = `Write a professional cover letter (300-400 words) for the following job:\n\nJob Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nDescription: ${job.description?.slice(0, 1000)}\n\nApplicant Name: ${userName || 'the applicant'}\nBackground: ${userBackground || 'an experienced professional'}\n\nGuidelines:\n- Professional, warm, and confident tone\n- Reference the company by name\n- Highlight relevant skills\n- End with a clear call to action\n- Do NOT use placeholder brackets\n\nWrite only the cover letter, no extra commentary.`;

    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 20000 }
    );

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No content from Gemini');

    res.json({ coverLetter: text, fallback: false });
  } catch (e) {
    console.error('Gemini error:', e.message);
    res.json({ coverLetter: fallbackTemplate(job, userName), fallback: true });
  }
});

function fallbackTemplate(job, name) {
  return `Dear Hiring Manager at ${job.company},\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}. Having reviewed the role requirements, I am confident that my skills and experience make me an excellent candidate for this opportunity.\n\nThroughout my career, I have developed a robust skill set that aligns closely with what ${job.company} is seeking. I have consistently demonstrated the ability to deliver results in fast-paced, remote environments — a quality that is essential for this ${job.jobType} role.\n\nWhat particularly excites me about ${job.company} is the opportunity to contribute to a team that values innovation and excellence. I am drawn to remote work not just for its flexibility, but because it allows me to work with talented professionals across the globe and deliver my best work without geographical constraints.\n\nI am a highly motivated, detail-oriented professional with strong communication skills. I thrive when given ownership of projects and have a track record of exceeding expectations while working independently. I am proficient in the tools and technologies commonly used in remote settings, and I am always eager to learn and adapt.\n\nI would welcome the opportunity to discuss how my background and enthusiasm can contribute to ${job.company}'s continued success. I am available for an interview at your convenience and look forward to the possibility of joining your team.\n\nThank you sincerely for considering my application.\n\nWarm regards,\n${name || 'Applicant'}`;
}

module.exports = router;
