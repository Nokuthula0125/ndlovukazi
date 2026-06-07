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

const DEFAULT_KEYWORDS = [
  'leadership','management','communication','teamwork','problem-solving',
  'excel','microsoft office','google workspace','crm','salesforce',
  'customer service','project management','data analysis','budget',
  'kpi','sla','stakeholder','agile','scrum','reporting',
  'presentation','negotiation','strategy','planning','coordination',
  'remote work','virtual','time management','multitasking','detail-oriented',
];

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
  const density = found.length / keywords.length;

  // Bonus points for structure
  let bonus = 0;
  if (/experience|work history/i.test(lower)) bonus += 5;
  if (/education|qualification/i.test(lower)) bonus += 5;
  if (/skills|competenc/i.test(lower)) bonus += 5;
  if (/summary|objective|profile/i.test(lower)) bonus += 5;
  if (text.length > 500) bonus += 5;

  const score = Math.min(100, Math.round(density * 70 + bonus));
  const suggestions = [];
  if (score < 40) suggestions.push('Your CV is missing many important keywords. Add a Skills section listing relevant tools and competencies.');
  if (!/summary|objective|profile/i.test(lower)) suggestions.push('Add a Professional Summary at the top of your CV.');
  if (!/quantif|%|number|\$|metric/i.test(lower)) suggestions.push('Quantify your achievements (e.g. "increased sales by 30%").');
  if (text.length < 500) suggestions.push('Your CV is very short. Add more detail about your experience.');
  if (!/linkedin/i.test(lower)) suggestions.push('Add your LinkedIn profile URL.');

  return { score, foundKeywords: found, missingKeywords: missing.slice(0, 10), suggestions };
}

router.post('/upload', auth, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please upload a PDF or DOCX file' });

  try {
    const text = await extractText(req.file);
    if (!text || text.length < 50) return res.status(400).json({ error: 'Could not extract text from file' });

    // Get admin-configured keywords
    const adminKws = await prisma.atsKeyword.findMany();
    const keywords = adminKws.length > 0 ? adminKws.map(k => k.keyword) : DEFAULT_KEYWORDS;

    const { score, foundKeywords, missingKeywords, suggestions } = scoreCV(text, keywords);

    const record = await prisma.cvUpload.create({
      data: {
        userId: req.user.id,
        filename: req.file.originalname,
        atsScore: score,
        missingKws: missingKeywords.join(','),
        suggestions: suggestions.join('|'),
      },
    });

    res.json({
      id: record.id,
      score,
      foundKeywords,
      missingKeywords,
      suggestions,
      message: score >= 70 ? '✅ Great ATS score! Your CV is well-optimised.' :
               score >= 40 ? '⚠️ Your CV needs some improvements to pass ATS.' :
               '❌ Your CV may be filtered out. Follow the suggestions below.',
    });
  } catch (e) {
    console.error('CV parse error:', e.message);
    res.status(500).json({ error: 'Failed to analyse CV' });
  } finally {
    // Clean up uploaded file
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
});

router.get('/history', auth, async (req, res) => {
  const uploads = await prisma.cvUpload.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  res.json({ uploads });
});

module.exports = router;
