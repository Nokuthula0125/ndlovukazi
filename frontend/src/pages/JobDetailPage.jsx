import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Clock, Bookmark, ExternalLink, Sparkles, Flag, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import CoverLetterModal from '../components/jobs/CoverLetterModal'
import toast from 'react-hot-toast'

// ── CV Match Checker Component ────────────────────────────
function CVMatchChecker({ job }) {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const check = async () => {
    if (!file) return toast.error('Please select your CV file first')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('cv', file)
      fd.append('jobId', job.id)
      const { data } = await api.post('/cv/check-job', fd)
      setResult(data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to check CV')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = result
    ? result.score >= 70 ? 'text-emerald-light' : result.score >= 40 ? 'text-gold' : 'text-red-400'
    : 'text-white'

  const scoreBg = result
    ? result.score >= 70 ? 'bg-emerald/10 border-emerald/30' : result.score >= 40 ? 'bg-gold/10 border-gold/30' : 'bg-red-500/10 border-red-500/30'
    : ''

  return (
    <div className="card mb-6 overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald/15 border border-emerald/30 flex items-center justify-center text-base">🎯</div>
          <div>
            <div className="font-semibold text-white text-sm">Check if your CV matches this job</div>
            <div className="text-xs text-white/40 mt-0.5">Get an ATS score specific to this role's requirements</div>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-white/[0.07] p-5">
          {!user ? (
            <div className="text-center py-4">
              <p className="text-white/50 text-sm mb-3">Sign in to check your CV against this job</p>
              <Link to="/login" className="btn-primary text-sm">Sign In</Link>
            </div>
          ) : !result ? (
            <div className="space-y-4">
              <p className="text-white/50 text-sm">
                Upload your CV and we'll score it specifically against <strong className="text-white">{job.title}</strong> at <strong className="text-gold">{job.company}</strong> — not a generic score, but based on this job's actual requirements.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={e => setFile(e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  📎 {file ? file.name : 'Choose CV (PDF or DOCX)'}
                </button>
                {file && (
                  <button
                    onClick={check}
                    disabled={loading}
                    className="btn-primary text-sm"
                  >
                    {loading ? '⏳ Analysing...' : '🎯 Check My CV'}
                  </button>
                )}
              </div>
              <p className="text-xs text-white/30">Your CV is analysed and immediately deleted. We never store your file.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score */}
              <div className={`rounded-xl border p-4 flex items-center gap-4 ${scoreBg}`}>
                <div className={`text-4xl font-bold font-serif ${scoreColor}`}>{result.score}<span className="text-xl">/100</span></div>
                <div>
                  <div className="font-semibold text-white text-sm">{result.message}</div>
                  <div className="text-xs text-white/40 mt-0.5">{result.foundKeywords?.length} of {result.totalKeywords} job keywords found in your CV</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="w-full h-2 bg-white/[0.07] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${result.score >= 70 ? 'bg-emerald' : result.score >= 40 ? 'bg-gold' : 'bg-red-400'}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>

              {/* Found keywords */}
              {result.foundKeywords?.length > 0 && (
                <div>
                  <div className="text-xs text-white/30 uppercase tracking-wide mb-2">✅ Matched keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {result.foundKeywords.slice(0, 10).map(kw => (
                      <span key={kw} className="text-xs bg-emerald/10 border border-emerald/20 text-emerald-light px-2.5 py-1 rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {result.missingKeywords?.length > 0 && (
                <div>
                  <div className="text-xs text-white/30 uppercase tracking-wide mb-2">❌ Missing keywords — add these to your CV</div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map(kw => (
                      <span key={kw} className="text-xs bg-red-500/10 border border-red-500/20 text-red-300 px-2.5 py-1 rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="bg-white/[0.03] rounded-xl p-4 space-y-2">
                  <div className="text-xs text-white/30 uppercase tracking-wide mb-3">💡 How to improve your score</div>
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-2 text-sm text-white/60">
                      <span className="text-gold shrink-0 mt-0.5">→</span>{s}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button onClick={() => { setResult(null); setFile(null) }} className="btn-ghost text-sm">
                  Try with a different CV
                </button>
                <Link to="/cv-templates" className="btn-secondary text-sm">
                  📄 Get a Better CV Template
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main JobDetailPage ────────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [saved, setSaved] = useState(false)
  const [flagging, setFlagging] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then(r => { setSaved(r.data.isSaved); return r.data }),
  })

  const job = data?.job

  const toggleSave = async () => {
    if (!user) return toast.error('Sign in to save jobs')
    const { data: d } = await api.post(`/jobs/${id}/save`)
    setSaved(d.saved)
    toast.success(d.saved ? 'Job saved!' : 'Job removed')
  }

  const trackApply = () => api.post(`/jobs/${id}/click`).catch(() => {})

  const flagJob = async () => {
    if (!user) return toast.error('Sign in to report jobs')
    const reason = prompt('What is suspicious about this job?')
    if (!reason) return
    setFlagging(true)
    try {
      await api.post(`/jobs/${id}/flag`, { reason })
      toast.success('Job reported. Thank you for keeping the platform safe.')
    } catch { toast.error('Failed to report job') }
    finally { setFlagging(false) }
  }

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
      <div className="h-8 bg-white/[0.05] rounded mb-4 w-2/3" />
      <div className="h-96 bg-white/[0.03] rounded" />
    </div>
  )
  if (error || !job) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-white/50">Job not found.</p>
      <Link to="/jobs" className="btn-primary mt-6 inline-flex">← Back to Jobs</Link>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>{job.title} at {job.company} — Ndlovukazi</title>
        <meta name="description" content={`${job.title} at ${job.company}. ${job.location}. Apply on Ndlovukazi.`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          hiringOrganization: { "@type": "Organization", name: job.company, logo: job.logo },
          jobLocation: { "@type": "Place", address: job.location },
          employmentType: job.jobType.toUpperCase(),
          datePosted: job.postedAt,
          baseSalary: job.salary ? { "@type": "MonetaryAmount", description: job.salary } : undefined,
        })}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/jobs" className="btn-ghost mb-6 -ml-2 text-sm">
          <ArrowLeft size={15} /> Back to Jobs
        </Link>

        {/* Header card */}
        <div className={`card p-8 mb-6 ${job.sponsored ? 'card-sponsored' : ''}`}>
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-dark to-emerald flex items-center justify-center text-white font-bold font-serif text-2xl shrink-0 overflow-hidden">
              {job.logo ? <img src={job.logo} alt={job.company} className="w-full h-full object-contain" /> : job.company[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {job.sponsored && <span className="badge badge-sponsored">⭐ Sponsored</span>}
                {job.verified && <span className="badge badge-verified">✓ Verified</span>}
                <span className="badge badge-remote">{job.jobType}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">{job.title}</h1>
              <p className="text-gold font-semibold text-lg">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-6">
            <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</span>
            <span className="bg-white/[0.06] px-3 py-1 rounded-full">{job.category}</span>
            {job.salary && <span className="text-emerald-light font-semibold font-serif">{job.salary}</span>}
          </div>

          <div className="flex flex-wrap gap-3">
            {job.sourceUrl && (
              <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={trackApply}
                className="btn-primary">
                Apply on Original Site <ExternalLink size={15} />
              </a>
            )}
            <button onClick={() => setShowCoverLetter(true)} className="btn-secondary">
              <Sparkles size={15} /> Generate Cover Letter with AI
            </button>
            <button onClick={toggleSave}
              className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium ${
                saved ? 'border-gold/50 text-gold bg-gold/10' : 'border-white/10 text-white/50 hover:border-gold/30 hover:text-gold'
              }`}>
              <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Saved' : 'Save Job'}
            </button>
            <button onClick={flagJob} disabled={flagging}
              className="px-4 py-3 rounded-lg border border-red-500/20 text-red-400/70 hover:border-red-500/40 hover:text-red-400 transition-all flex items-center gap-2 text-sm font-medium">
              <Flag size={15} /> Report
            </button>
          </div>
        </div>

        {/* 🎯 CV Match Checker — sits right before job description */}
        <CVMatchChecker job={job} />

        {/* Description */}
        <div className="card p-8">
          <h2 className="font-serif text-xl font-bold mb-5">Job Description</h2>
          <div
            className="text-white/70 leading-relaxed prose-invert text-sm space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:font-serif [&_h2]:text-white [&_h2]:text-lg [&_h3]:text-white [&_strong]:text-white/90"
            dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, '<br/>') }}
          />
          {job.tags && (
            <div className="mt-6 pt-5 border-t border-white/[0.07]">
              <div className="text-xs text-white/30 uppercase tracking-wide mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {job.tags.split(',').filter(Boolean).map(tag => (
                  <span key={tag} className="bg-white/[0.05] text-white/50 text-xs px-3 py-1 rounded-full">{tag.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Apply CTA */}
        {job.sourceUrl && (
          <div className="mt-6 text-center py-8 border border-emerald/20 rounded-2xl bg-emerald/[0.04]">
            <p className="text-white/50 text-sm mb-4">Ready to apply? Continue on the original job posting.</p>
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={trackApply}
              className="btn-primary inline-flex">
              Apply on Original Site <ExternalLink size={15} />
            </a>
          </div>
        )}
      </div>

      {showCoverLetter && <CoverLetterModal job={job} onClose={() => setShowCoverLetter(false)} />}
    </>
  )
}
