const cron = require('node-cron');
const { fetchAllJobs, expireOldJobs } = require('../services/jobFetcher');
const { sendAlertDigests } = require('../services/alerts');

function startCronJobs() {
  // Fetch jobs every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Cron] Running job fetch...');
    await fetchAllJobs();
  });

  // Expire old jobs daily at 2am
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Running job expiry...');
    await expireOldJobs();
  });

  // Send daily alerts at 8am
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Sending daily job alerts...');
    await sendAlertDigests('daily');
  });

  // Send weekly alerts every Monday at 9am
  cron.schedule('0 9 * * 1', async () => {
    console.log('[Cron] Sending weekly job alerts...');
    await sendAlertDigests('weekly');
  });

  // Fetch on startup (dev/first run)
  if (process.env.NODE_ENV !== 'test') {
    setTimeout(() => fetchAllJobs(), 3000);
  }

  console.log('[Cron] Scheduled jobs started');
}

module.exports = { startCronJobs };
