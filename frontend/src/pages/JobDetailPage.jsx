import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Clock, Bookmark, ExternalLink, Sparkles, Flag, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import CoverLetterModal from '../components/jobs/CoverLetterModal'
import toast from 'react-hot-toast'

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

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse"><div className="h-8 bg-white/[0.05] rounded mb-4 w-2/3" /><div className="h-96 bg-white/[0.03] rounded" /></div>
  if (error || !job) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><p className="text-white/50">Job not found.</p><Link to="/jobs" className="btn-primary mt-6 inline-flex">← Back to Jobs</Link></div>

  return (
    <>
      <Helmet>
        <title>{job.title} at {job.company} — Ndlovukazi</title>
        <meta name="description" content={`${job.title} at ${job.company}. ${job.location}. Apply on Ndlovukazi.`} />
        {/* JobPosting schema.org */}
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

          {/* Actions */}
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
