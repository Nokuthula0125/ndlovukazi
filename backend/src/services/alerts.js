const prisma = require('../utils/prisma');
const { sendJobAlertDigest } = require('./email');

async function sendAlertDigests(frequency) {
  const alerts = await prisma.jobAlert.findMany({
    where: { frequency, active: true },
    include: { user: true },
  });

  const since = frequency === 'daily'
    ? new Date(Date.now() - 24 * 60 * 60 * 1000)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const alert of alerts) {
    const categories = alert.categories.split(',').filter(Boolean);
    const jobTypes = alert.jobTypes?.split(',').filter(Boolean) || [];
    const keywords = alert.keywords?.split(',').filter(Boolean) || [];

    const where = {
      expired: false,
      postedAt: { gte: since },
      ...(categories.length && { category: { in: categories } }),
      ...(jobTypes.length && { jobType: { in: jobTypes } }),
    };

    const jobs = await prisma.job.findMany({ where, take: 20 });

    const filtered = keywords.length
      ? jobs.filter(j => keywords.some(kw =>
          j.title.toLowerCase().includes(kw.toLowerCase()) ||
          j.description.toLowerCase().includes(kw.toLowerCase())
        ))
      : jobs;

    if (filtered.length > 0) {
      await sendJobAlertDigest(alert.user, filtered);
      await prisma.jobAlert.update({
        where: { id: alert.id },
        data: { lastSentAt: new Date() },
      });
    }
  }
}

module.exports = { sendAlertDigests };
