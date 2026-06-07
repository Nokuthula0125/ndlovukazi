import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/authStore'

const templates = [
  {
    id: 'ats',
    name: 'ATS-Optimized',
    badge: '🏆 Most Recommended',
    badgeColor: 'bg-emerald/20 text-emerald-light border-emerald/30',
    desc: 'Plain, clean layout designed to pass Applicant Tracking Systems. No tables, no graphics. Maximum keyword compatibility.',
    best: 'Corporate jobs, large companies, online applications',
    color: 'border-emerald/40',
  },
  {
    id: 'professional',
    name: 'Professional Classic',
    badge: '💼 Traditional',
    badgeColor: 'bg-gold/10 text-gold border-gold/30',
    desc: 'Traditional two-column layout with a strong work history focus. Clean and formal — great for management roles.',
    best: 'HR, Operations, Administrative, Management roles',
    color: 'border-gold/30',
  },
  {
    id: 'remote',
    name: 'Remote Work Specialist',
    badge: '🌍 Africa-Ready',
    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    desc: 'Skills-first layout that highlights remote work competencies, tools, and time zone flexibility. Perfect for virtual assistant and remote roles.',
    best: 'Virtual Assistant, Customer Support, Remote Operations',
    color: 'border-blue-500/30',
  },
]

function generateTemplate(id, user) {
  const name = user?.name || 'Your Full Name'
  const email = user?.email || 'your.email@gmail.com'
  const linkedin = user?.linkedinUrl || 'linkedin.com/in/yourprofile'
  const skills = user?.skills || 'Microsoft Office, Google Workspace, Customer Service, Communication, Time Management'
  const experience = user?.experience || '3'
  const country = user?.country || 'South Africa'

  const base = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} — CV</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #222; background: #fff; max-width: 800px; margin: 0 auto; padding: 32px; }
  h1 { font-size: 22pt; color: #046A38; margin-bottom: 4px; }
  h2 { font-size: 12pt; color: #046A38; border-bottom: 1.5px solid #046A38; padding-bottom: 3px; margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 1px; }
  h3 { font-size: 11pt; font-weight: bold; margin-bottom: 2px; }
  .contact { font-size: 10pt; color: #555; margin-bottom: 4px; }
  .subtitle { font-size: 12pt; color: #555; margin-bottom: 8px; }
  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; }
  .date { font-size: 10pt; color: #777; }
  ul { padding-left: 18px; margin-top: 4px; }
  li { margin-bottom: 3px; font-size: 10.5pt; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill { background: #e8f5ee; color: #046A38; padding: 3px 10px; border-radius: 12px; font-size: 10pt; }
  p { font-size: 10.5pt; line-height: 1.6; color: #444; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>`

  if (id === 'ats') {
    return base + `
<h1>${name}</h1>
<div class="subtitle">Remote Work Professional | ${country}</div>
<div class="contact">📧 ${email} &nbsp;|&nbsp; 🔗 ${linkedin} &nbsp;|&nbsp; 📍 ${country} (Available for remote roles globally)</div>

<h2>Professional Summary</h2>
<p>Results-driven professional with ${experience}+ years of experience in remote operations, administration, and client management. Proven ability to work independently across time zones with strong communication and organisational skills. Passionate about delivering high-quality work in fast-paced, remote environments.</p>

<h2>Key Skills</h2>
<div class="skills-grid">
  ${(skills).split(',').map(s => `<span class="skill">${s.trim()}</span>`).join('')}
  <span class="skill">Remote Collaboration</span>
  <span class="skill">Time Management</span>
  <span class="skill">Attention to Detail</span>
</div>

<h2>Professional Experience</h2>
<div class="entry">
  <div class="entry-header">
    <h3>[Job Title] — [Company Name]</h3>
    <span class="date">[Start Date] – [End Date]</span>
  </div>
  <p>[Location / Remote]</p>
  <ul>
    <li>Managed [key responsibility] resulting in [measurable outcome]</li>
    <li>Coordinated [task/project] across [team/department/client base]</li>
    <li>Implemented [process/system] that improved [metric] by [percentage]</li>
    <li>Handled [volume] of [tasks] daily with [accuracy/efficiency metric]</li>
  </ul>
</div>
<div class="entry">
  <div class="entry-header">
    <h3>[Job Title] — [Company Name]</h3>
    <span class="date">[Start Date] – [End Date]</span>
  </div>
  <ul>
    <li>Replace this with your actual job duties and achievements</li>
    <li>Always quantify where possible — numbers stand out to ATS systems</li>
  </ul>
</div>

<h2>Education</h2>
<div class="entry">
  <div class="entry-header">
    <h3>[Qualification Name] — [Institution]</h3>
    <span class="date">[Year]</span>
  </div>
</div>

<h2>Tools & Technology</h2>
<p>Microsoft Office Suite · Google Workspace · Slack · Zoom · Trello · Asana · [Add your tools]</p>

<h2>References</h2>
<p>Available upon request.</p>
</body></html>`
  }

  if (id === 'professional') {
    return base + `
<h1>${name}</h1>
<div class="subtitle">HR | Operations | Administrative Professional</div>
<div class="contact">📧 ${email} &nbsp;|&nbsp; 🔗 ${linkedin} &nbsp;|&nbsp; 📍 ${country}</div>

<h2>Profile</h2>
<p>Dedicated and detail-oriented professional with ${experience}+ years of progressive experience in [your field]. Adept at managing complex workloads, leading cross-functional teams, and driving operational excellence. Committed to delivering results that align with organisational goals.</p>

<h2>Core Competencies</h2>
<div class="skills-grid">
  ${(skills).split(',').map(s => `<span class="skill">${s.trim()}</span>`).join('')}
</div>

<h2>Professional Experience</h2>
<div class="entry">
  <div class="entry-header">
    <h3>[Senior Job Title] — [Company Name]</h3>
    <span class="date">[Month Year] – Present</span>
  </div>
  <ul>
    <li>Led a team of [X] to achieve [specific outcome], exceeding targets by [%]</li>
    <li>Spearheaded [project/initiative] that delivered [result/saving/improvement]</li>
    <li>Developed and implemented [process] reducing [issue] by [metric]</li>
    <li>Managed [budget/resource/team] of [size/value]</li>
  </ul>
</div>
<div class="entry">
  <div class="entry-header">
    <h3>[Previous Job Title] — [Company Name]</h3>
    <span class="date">[Month Year] – [Month Year]</span>
  </div>
  <ul>
    <li>Describe your key responsibilities and achievements here</li>
    <li>Use strong action verbs: managed, coordinated, implemented, delivered</li>
  </ul>
</div>

<h2>Education & Qualifications</h2>
<div class="entry">
  <div class="entry-header">
    <h3>[Degree/Diploma] — [Institution Name]</h3>
    <span class="date">[Year]</span>
  </div>
</div>
<div class="entry">
  <div class="entry-header">
    <h3>[Certificate/Short Course] — [Provider]</h3>
    <span class="date">[Year]</span>
  </div>
</div>

<h2>References</h2>
<p>Available upon request.</p>
</body></html>`
  }

  // remote template
  return base + `
<h1>${name}</h1>
<div class="subtitle">🌍 Remote Work Specialist | Virtual Assistant | ${country}</div>
<div class="contact">📧 ${email} &nbsp;|&nbsp; 🔗 ${linkedin} &nbsp;|&nbsp; ⏰ Available across multiple time zones</div>

<h2>Why Hire Me Remotely</h2>
<p>Self-motivated remote professional with ${experience}+ years of experience delivering high-quality work from home. Fully equipped home office, reliable internet, and proven track record of managing tasks independently without supervision. I treat remote work as a career — not just a convenience.</p>

<h2>Remote-Ready Skills</h2>
<div class="skills-grid">
  <span class="skill">Async Communication</span>
  <span class="skill">Self-Management</span>
  <span class="skill">Digital Tools Expert</span>
  ${(skills).split(',').map(s => `<span class="skill">${s.trim()}</span>`).join('')}
</div>

<h2>Tools I Use Daily</h2>
<p><strong>Communication:</strong> Slack, Zoom, Microsoft Teams, Google Meet<br>
<strong>Project Management:</strong> Trello, Asana, ClickUp, Notion<br>
<strong>Productivity:</strong> Google Workspace, Microsoft Office, Canva<br>
<strong>Add your own:</strong> [List tools relevant to the job]</p>

<h2>Remote Work Experience</h2>
<div class="entry">
  <div class="entry-header">
    <h3>[Virtual Assistant / Remote Role] — [Company / Client]</h3>
    <span class="date">[Date] – [Date] | 100% Remote</span>
  </div>
  <ul>
    <li>Managed [executive/client] calendar, scheduling across [X] time zones</li>
    <li>Handled inbox management, responding to [X] emails daily with [turnaround time]</li>
    <li>Coordinated [projects/tasks] using [tools], delivering [outcomes]</li>
    <li>Maintained [records/databases/reports] with 100% accuracy</li>
  </ul>
</div>

<h2>Education</h2>
<div class="entry">
  <div class="entry-header">
    <h3>[Qualification] — [Institution]</h3>
    <span class="date">[Year]</span>
  </div>
</div>

<h2>References</h2>
<p>Available upon request.</p>
</body></html>`
}

export default function CVTemplatesPage() {
  const { user } = useAuthStore()
  const [downloading, setDownloading] = useState(null)

  const download = (id) => {
    setDownloading(id)
    const html = generateTemplate(id, user)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ndlovukazi-cv-template-${id}.html`
    a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setDownloading(null), 1000)
  }

  return (
    <>
      <Helmet>
        <title>Free CV Templates — Ndlovukazi</title>
        <meta name="description" content="Download free professional CV templates optimised for remote jobs and ATS systems. Built for African professionals." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald/10 border border-emerald/30 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-light tracking-widest uppercase mb-4">
            100% Free Templates
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-3">CV Templates</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Professional templates built for remote jobs and African professionals.
            {user ? ` Pre-filled with your profile info, ${user.name?.split(' ')[0]}!` : ' Sign in to pre-fill with your details.'}
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-10 flex flex-wrap gap-6">
          {[
            ['1', 'Download template', 'Click Download — opens as HTML file on your device'],
            ['2', 'Open in browser', 'Double-click the file — opens in Chrome/Edge'],
            ['3', 'Print to PDF', 'Press Ctrl+P → Save as PDF → done!'],
            ['4', 'Edit content', 'Open in Notepad/VS Code to customise text'],
          ].map(([num, title, desc]) => (
            <div key={num} className="flex gap-3 min-w-[200px] flex-1">
              <div className="w-7 h-7 rounded-full bg-emerald/20 border border-emerald/30 flex items-center justify-center text-emerald-light text-xs font-bold shrink-0">{num}</div>
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-xs text-white/40 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Templates */}
        <div className="grid md:grid-cols-3 gap-6">
          {templates.map(t => (
            <div key={t.id} className={`card p-6 flex flex-col border ${t.color}`}>
              <div className={`inline-flex self-start text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${t.badgeColor}`}>
                {t.badge}
              </div>
              <h2 className="font-serif text-xl font-bold mb-2">{t.name}</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-4 flex-1">{t.desc}</p>
              <div className="bg-white/[0.03] rounded-xl p-3 mb-5">
                <div className="text-xs text-white/30 uppercase tracking-wide mb-1">Best for</div>
                <div className="text-xs text-white/60">{t.best}</div>
              </div>
              <button
                onClick={() => download(t.id)}
                disabled={downloading === t.id}
                className="btn-primary w-full justify-center"
              >
                {downloading === t.id ? '⏳ Preparing...' : '⬇️ Download Template'}
              </button>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-12 bg-gold/[0.06] border border-gold/20 rounded-2xl p-6">
          <h3 className="font-serif font-bold text-lg mb-4 text-gold">💡 Pro Tips for Remote Job Applications</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Always use the CV ATS Checker on a job post before applying — tailor your CV to that specific role',
              'Put your time zone availability in your summary — remote employers love this',
              'List every tool you know — Zoom, Slack, Trello, Google Workspace all count',
              'Mention "remote work" or "work from home" experience explicitly',
              'Keep your CV to 2 pages maximum — recruiters spend 7 seconds on first scan',
              'Use numbers everywhere: "managed 5 clients", "processed 200 invoices/month"',
            ].map((tip, i) => (
              <div key={i} className="flex gap-2 text-sm text-white/60">
                <span className="text-gold shrink-0">✓</span>{tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
