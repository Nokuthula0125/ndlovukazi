const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'noreply@remotejobsndlovukazi.com';
const FOUNDER = process.env.FOUNDER_EMAIL || 'nokuthulandlovu717@gmail.com';

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_your')) {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const sendWelcomeEmail = (user) => sendEmail({
  to: user.email,
  subject: 'Welcome to Remote Jobs with Ndlovukazi! 🎉',
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:40px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="background:linear-gradient(135deg,#046A38,#D4AF37);width:60px;height:60px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;">N</div>
        <h1 style="color:#D4AF37;font-size:1.5rem;margin-top:16px;">Remote Jobs with Ndlovukazi</h1>
      </div>
      <h2 style="color:#fff;">Welcome, ${user.name}! 👋</h2>
      <p style="color:rgba(255,255,255,0.7);line-height:1.7;">You're now part of Africa's most trusted remote job platform. Here's what you can do:</p>
      <ul style="color:rgba(255,255,255,0.7);line-height:2;">
        <li>🔍 Browse 2,400+ verified remote jobs</li>
        <li>🤖 Generate AI cover letters instantly</li>
        <li>📄 Check your CV ATS score for free</li>
        <li>🔔 Set up job alerts for your dream role</li>
      </ul>
      <div style="text-align:center;margin-top:32px;">
        <a href="${process.env.FRONTEND_URL}/jobs" style="background:#046A38;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Browse Jobs Now →</a>
      </div>
      <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin-top:40px;text-align:center;">⚠️ NEVER PAY FOR A JOB. Report suspicious listings at ${FOUNDER}</p>
    </div>
  `,
});

const sendPasswordReset = (user, resetToken) => sendEmail({
  to: user.email,
  subject: 'Reset your Ndlovukazi password',
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:40px;border-radius:12px;">
      <h2 style="color:#D4AF37;">Password Reset Request</h2>
      <p style="color:rgba(255,255,255,0.7);">Click the link below to reset your password. This link expires in 1 hour.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" style="background:#046A38;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
      </div>
      <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;">If you didn't request this, ignore this email.</p>
    </div>
  `,
});

const sendJobAlertDigest = (user, jobs) => sendEmail({
  to: user.email,
  subject: `🔔 ${jobs.length} new remote jobs for you — Ndlovukazi`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:40px;border-radius:12px;">
      <h2 style="color:#D4AF37;">Your Job Alert — ${jobs.length} New Jobs</h2>
      ${jobs.slice(0, 10).map(j => `
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:16px;margin-bottom:12px;">
          <div style="font-weight:700;color:#fff;">${j.title}</div>
          <div style="color:#D4AF37;font-size:0.85rem;">${j.company}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:0.78rem;margin-top:4px;">${j.location} · ${j.jobType}</div>
          <a href="${process.env.FRONTEND_URL}/jobs/${j.id}" style="display:inline-block;margin-top:10px;background:#046A38;color:#fff;padding:7px 16px;border-radius:6px;text-decoration:none;font-size:0.8rem;">View Job</a>
        </div>
      `).join('')}
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.FRONTEND_URL}/dashboard/alerts" style="color:#D4AF37;font-size:0.85rem;">Manage Alerts</a>
      </div>
    </div>
  `,
});

const sendFlagNotification = (job, reason) => sendEmail({
  to: FOUNDER,
  subject: `🚩 Job Flagged as Suspicious: ${job.title}`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2>Job Flagged as Suspicious</h2>
      <p><strong>Job:</strong> ${job.title} at ${job.company}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
      <p><strong>Source URL:</strong> ${job.sourceUrl || 'N/A'}</p>
      <p>Please review this listing in the admin panel.</p>
    </div>
  `,
});

const sendContactEmail = ({ name, email, message }) => sendEmail({
  to: FOUNDER,
  subject: `📬 New Contact Message from ${name}`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2>New Contact Message</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Message:</strong></p>
      <p style="background:#f5f5f5;padding:16px;border-radius:8px;">${message}</p>
    </div>
  `,
});

module.exports = {
  sendWelcomeEmail,
  sendPasswordReset,
  sendJobAlertDigest,
  sendFlagNotification,
  sendContactEmail,
};
