const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const prisma = require('../utils/prisma');
const { auth } = require('../middleware/auth');

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `cv_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10_485_760 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

// ── Master skills list for job-specific matching ──────────
const MASTER_SKILLS = [
  'microsoft excel','microsoft word','microsoft office','google sheets','google docs',
  'google workspace','salesforce','hubspot','quickbooks','xero','sage','zoho',
  'slack','zoom','teams','asana','trello','notion','monday.com','jira','clickup',
  'shopify','wordpress','canva','adobe','figma','mailchimp',
  'javascript','python','sql','html','css','react','node.js','php','java',
  'data analysis','power bi','tableau','looker',
  'project management','customer service','customer support','account management',
  'social media','content creation','copywriting','email marketing',
  'digital marketing','seo','bookkeeping','accounting','invoicing','billing',
  'scheduling','calendar management','inbox management','email management','data entry',
  'research','reporting','budgeting','procurement','purchasing',
  'hr','recruitment','onboarding','training','payroll','performance management',
  'communication','leadership','teamwork','problem solving','time management',
  'multitasking','attention to detail','organization','adaptability',
  'critical thinking','negotiation','presentation','public speaking',
  'remote work','virtual assistant','work from home','client management',
  'kpi','sla','crm','erp','sap','operations','logistics','supply chain',
  'administrative','coordination','planning','strategy','analysis',
];

function extractJobKeywords(job) {
  const text = `${job.title} ${job.description} ${job.tags || ''} ${job.category}`.toLowerCase();
  const matched = MASTER_SKILLS.filter(skill => text.includes(skill));
  // Also grab meaningful words from title
  const titleWords = job.title.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4 && !['with','that','this','from','into','about','remote','work','jobs'].includes(w));
  return [...new Set([...matched, ...titleWords])].slice(0, 30);
}

async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') {
    const buf = fs.readFileSync(file.path);
    const data = await pdf(buf);
    return data.text;
  }
  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: file.path });
    return result.value;
  }
  return '';
}

function scoreCV(text, keywords) {
  const lower = text.toLowerCase();
  const found = keywords.filter(kw => lower.includes(kw.toLowerCase()));
  const missing = keywords.filter(kw => !lower.includes(kw.toLowerCase()));
  const density = keywords.length > 0 ? found.length / keywords.length : 0;

  let bonus = 0;
  if (/experience|work history/i.test(lower)) bonus += 5;
  if (/education|qualification/i.test(lower)) bonus += 5;
  if (/skills|competenc/i.test(lower)) bonus += 5;
  if (/summary|objective|profile/i.test(lower)) bonus += 5;
  if (text.length > 500) bonus += 5;

  const score = Math.min(100, Math.round(density * 70 + bonus));
  const suggestions = [];
  if (score < 40) suggestions.push('Your CV is missing many keywords from this job. Add a Skills section listing the tools and competencies mentioned in the job description.');
  if (!/summary|objective|profile/i.test(lower)) suggestions.push('Add a Professional Summary at the top of your CV tailored to this specific role.');
  if (!/quantif|%|number|\$|metric|achieve/i.test(lower)) suggestions.push('Quantify your achievements — e.g. "Managed 50+ client accounts" or "Reduced processing time by 30%".');
  if (text.length < 500) suggestions.push('Your CV is very short. Add more detail about your roles and responsibilities.');
  if (!/linkedin/i.test(lower)) suggestions.push('Add your LinkedIn profile URL to increase credibility.');
  if (missing.length > 0) suggestions.push(`Add these missing keywords naturally into your CV: ${missing.slice(0, 5).join(', ')}.`);

  return { score, foundKeywords: found, missingKeywords: missing.slice(0, 10), suggestions };
}

// ── General CV upload (dashboard) ─────────────────────────
const DEFAULT_KEYWORDS = [
  'leadership','management','communication','teamwork','problem-solving',
  'excel','microsoft office','google workspace','crm','salesforce',
  'customer service','project management','data analysis','budget',
  'kpi','sla','stakeholder','agile','scrum','reporting',
  'presentation','negotiation','strategy','planning','coordination',
  'remote work','virtual','time management','multitasking','detail-oriented',
];

router.post('/upload', auth, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please upload a PDF or DOCX file' });
  try {
    const text = await extractText(req.file);
    if (!text || text.length < 50) return res.status(400).json({ error: 'Could not extract text from file' });
    const adminKws = await prisma.atsKeyword.findMany();
    const keywords = adminKws.length > 0 ? adminKws.map(k => k.keyword) : DEFAULT_KEYWORDS;
    const { score, foundKeywords, missingKeywords, suggestions } = scoreCV(text, keywords);
    const record = await prisma.cvUpload.create({
      data: { userId: req.user.id, filename: req.file.originalname, atsScore: score, missingKws: missingKeywords.join(','), suggestions: suggestions.join('|') },
    });
    res.json({
      id: record.id, score, foundKeywords, missingKeywords, suggestions,
      message: score >= 70 ? '✅ Great ATS score! Your CV is well-optimised.' :
               score >= 40 ? '⚠️ Your CV needs some improvements to pass ATS.' :
               '❌ Your CV may be filtered out. Follow the suggestions below.',
    });
  } catch (e) {
    console.error('CV parse error:', e.message);
    res.status(500).json({ error: 'Failed to analyse CV' });
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
});

// ── Job-specific CV match checker ──────────────────────────
router.post('/check-job', auth, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please upload a PDF or DOCX file' });
  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ error: 'Job ID required' });
  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const text = await extractText(req.file);
    if (!text || text.length < 50) return res.status(400).json({ error: 'Could not extract text from file' });
    const keywords = extractJobKeywords(job);
    const { score, foundKeywords, missingKeywords, suggestions } = scoreCV(text, keywords);
    await prisma.cvUpload.create({
      data: { userId: req.user.id, filename: req.file.originalname, atsScore: score, missingKws: missingKeywords.join(','), suggestions: suggestions.join('|') },
    });
    res.json({
      score, foundKeywords, missingKeywords, suggestions,
      jobTitle: job.title, company: job.company,
      totalKeywords: keywords.length,
      message: score >= 70 ? '✅ Strong match! Your CV is well-aligned with this role.' :
               score >= 40 ? '⚠️ Decent match. Add the missing keywords to improve your chances.' :
               '❌ Low match. Tailor your CV specifically for this job before applying.',
    });
  } catch (e) {
    console.error('CV job check error:', e.message);
    res.status(500).json({ error: 'Failed to analyse CV' });
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
});

router.get('/history', auth, async (req, res) => {
  const uploads = await prisma.cvUpload.findMany({
    where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 10,
  });
  res.json({ uploads });
});

module.exports = router;
