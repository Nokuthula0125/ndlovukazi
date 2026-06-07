const axios = require('axios');
const RSSParser = require('rss-parser');
const prisma = require('../utils/prisma');

const rss = new RSSParser();

const CATEGORIES = ['Administrative','HR','Operations','Retail','Customer Support','Virtual Assistant','Tech','Entry-Level'];

function guessCategory(title = '', desc = '') {
  const text = `${title} ${desc}`.toLowerCase();
  if (/tech|developer|engineer|software|data|devops/.test(text)) return 'Tech';
  if (/virtual assistant|va /.test(text)) return 'Virtual Assistant';
  if (/customer|support|service/.test(text)) return 'Customer Support';
  if (/hr|human resource|recruit|talent/.test(text)) return 'HR';
  if (/admin|executive assistant|coordinator/.test(text)) return 'Administrative';
  if (/operation|ops|logistics/.test(text)) return 'Operations';
  if (/retail|sales|ecommerce|e-commerce/.test(text)) return 'Retail';
  if (/entry|junior|graduate|intern/.test(text)) return 'Entry-Level';
  return 'Administrative';
}

function guessJobType(title = '', tags = '') {
  const text = `${title} ${tags}`.toLowerCase();
  if (/contract/.test(text)) return 'Contract';
  if (/freelance/.test(text)) return 'Freelance';
  if (/hybrid/.test(text)) return 'Hybrid';
  if (/on.?site|onsite/.test(text)) return 'On-site';
  return 'Remote';
}

async function upsertJob(data) {
  try {
    await prisma.job.upsert({
      where: { title_company_location: { title: data.title, company: data.company, location: data.location } },
      update: { description: data.description, postedAt: new Date(), sourceUrl: data.sourceUrl, logo: data.logo, tags: data.tags, expired: false },
      create: data,
    });
  } catch (e) {
    if (!e.message?.includes('Unique')) console.error('Upsert error:', e.message);
  }
}

// ── Remotive ──────────────────────────────────────────────
async function fetchRemotive() {
  try {
    const { data } = await axios.get('https://remotive.com/api/remote-jobs?limit=200', { timeout: 15000 });
    const jobs = data.jobs || [];
    let count = 0;
    for (const j of jobs) {
      await upsertJob({
        externalId: String(j.id),
        title: j.title?.slice(0, 255) || 'Untitled',
        company: j.company_name || 'Unknown',
        location: j.candidate_required_location || 'Worldwide',
        salary: j.salary || null,
        category: guessCategory(j.title, j.description),
        jobType: guessJobType(j.title, j.tags?.join(' ')),
        source: 'remotive',
        sourceUrl: j.url,
        description: j.description?.slice(0, 5000) || '',
        logo: j.company_logo || null,
        tags: Array.isArray(j.tags) ? j.tags.join(',') : null,
        verified: true,
      });
      count++;
    }
    console.log(`[Remotive] Fetched/updated ${count} jobs`);
  } catch (e) {
    console.error('[Remotive] Fetch failed:', e.message);
  }
}

// ── RSS feeds ─────────────────────────────────────────────
const RSS_FEEDS = [
  { url: 'https://www.workingnomads.com/remote-jobs?format=rss', source: 'rss', name: 'Working Nomads' },
  { url: 'https://jobspresso.co/remote-work-rss/', source: 'rss', name: 'Jobspresso' },
  { url: 'https://weworkremotely.com/remote-jobs.rss', source: 'rss', name: 'We Work Remotely' },
  { url: 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss', source: 'rss', name: 'WWR Customer Support' },
  { url: 'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss', source: 'rss', name: 'WWR Sales & Marketing' },
  { url: 'https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss', source: 'rss', name: 'WWR Backend' },
  { url: 'https://remoteok.com/remote-jobs.rss', source: 'rss', name: 'Remote OK' },
];

async function fetchRSS(feed) {
  try {
    const parsed = await rss.parseURL(feed.url);
    let count = 0;
    for (const item of (parsed.items || [])) {
      const title = item.title?.replace(/\[.*?\]/g, '').trim() || 'Untitled';
      const company = item.author || item['dc:creator'] || parsed.title || 'Unknown';
      const location = item.categories?.[0] || 'Worldwide';
      await upsertJob({
        externalId: item.guid || item.link,
        title: title.slice(0, 255),
        company: company.slice(0, 255),
        location: location.slice(0, 255),
        salary: null,
        category: guessCategory(title, item.contentSnippet),
        jobType: 'Remote',
        source: feed.source,
        sourceUrl: item.link,
        description: item.content || item.contentSnippet || item.summary || '',
        logo: null,
        tags: item.categories?.join(',') || null,
        verified: true,
      });
      count++;
    }
    console.log(`[${feed.name}] Fetched/updated ${count} jobs`);
  } catch (e) {
    console.error(`[${feed.name}] Fetch failed:`, e.message);
  }
}

async function fetchAllJobs() {
  console.log('[JobFetcher] Starting job fetch...');
  await fetchRemotive();
  for (const feed of RSS_FEEDS) await fetchRSS(feed);
  console.log('[JobFetcher] Done.');
}

async function expireOldJobs() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const expired = await prisma.job.updateMany({
    where: { postedAt: { lt: thirtyDaysAgo }, expired: false },
    data: { expired: true },
  });
  if (expired.count > 0) console.log(`[Expiry] Marked ${expired.count} jobs as expired`);

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const deleted = await prisma.job.deleteMany({
    where: { postedAt: { lt: sixtyDaysAgo }, expired: true },
  });
  if (deleted.count > 0) console.log(`[Expiry] Deleted ${deleted.count} old jobs`);
}

module.exports = { fetchAllJobs, expireOldJobs };
