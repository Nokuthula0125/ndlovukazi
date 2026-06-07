import { Link } from 'react-router-dom'
import { MapPin, Clock, Bookmark, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function JobCard({ job, saved: initSaved = false, onUnsave }) {
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(initSaved)

  const toggleSave = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Sign in to save jobs')
    try {
      const { data } = await api.post(`/jobs/${job.id}/save`)
      setSaved(data.saved)
      toast.success(data.saved ? 'Job saved!' : 'Job removed')
      if (!data.saved && onUnsave) onUnsave(job.id)
    } catch { toast.error('Failed to save job') }
  }

  const isNew = new Date(job.postedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)

  return (
    <Link to={`/jobs/${job.id}`}
      className={`card block p-6 group relative ${job.sponsored ? 'card-sponsored' : ''}`}>
      {job.sponsored && <div className="shimmer absolute inset-0 rounded-2xl pointer-events-none" />}

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-dark to-emerald flex items-center justify-center text-white font-bold font-serif text-lg shrink-0 overflow-hidden">
          {job.logo ? <img src={job.logo} alt={job.company} className="w-full h-full object-contain" /> : job.company[0]}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end ml-2">
          {job.sponsored && <span className="badge badge-sponsored">⭐ Sponsored</span>}
          {job.verified && <span className="badge badge-verified">✓ Verified</span>}
          {isNew && <span className="badge badge-new">New</span>}
          <span className="badge badge-remote">{job.jobType}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif font-bold text-white text-lg leading-tight mb-1 group-hover:text-emerald-light transition-colors line-clamp-2">
        {job.title}
      </h3>
      <p className="text-gold text-sm font-medium mb-3">{job.company}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-white/40 mb-4">
        <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</span>
        <span className="bg-white/[0.06] px-2 py-0.5 rounded-full">{job.category}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.07]">
        <span className="font-serif font-bold text-emerald-light text-base">
          {job.salary || 'Competitive'}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={toggleSave}
            className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-gold' : 'text-white/30 hover:text-gold'}`}
            title={saved ? 'Unsave' : 'Save job'}>
            <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <span className="btn-primary text-xs py-1.5 px-3">
            View <ExternalLink size={11} />
          </span>
        </div>
      </div>
    </Link>
  )
}
