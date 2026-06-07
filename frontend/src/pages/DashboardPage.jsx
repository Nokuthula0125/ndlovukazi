import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Bookmark, FolderKanban, FileText, Bell, LayoutDashboard } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import JobCard from '../components/jobs/JobCard'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/dashboard/saved', icon: Bookmark, label: 'Saved Jobs' },
  { to: '/dashboard/cv', icon: FileText, label: 'CV & ATS' },
  { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/dashboard/alerts', icon: Bell, label: 'Job Alerts' },
]

function Overview() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/users/dashboard').then(r => r.data) })
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Saved Jobs', data?.savedJobs, '🔖'], ['Applications', data?.applications, '📋'], ['Active Alerts', data?.alerts, '🔔'], ['CV Uploads', data?.cvUploads, '📄']].map(([label, val, emoji]) => (
          <div key={label} className="card p-5">
            <div className="text-2xl mb-2">{emoji}</div>
            <div className="font-serif text-3xl font-bold text-gold">{val ?? '–'}</div>
            <div className="text-sm text-white/40 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Profile() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '', country: user?.country || '', skills: user?.skills || '', experience: user?.experience || '', linkedinUrl: user?.linkedinUrl || '', portfolioUrl: user?.portfolioUrl || '' })
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.put('/users/profile', data).then(r => r.data),
    onSuccess: ({ user }) => { updateUser(user); toast.success('Profile updated!') },
    onError: () => toast.error('Failed to update profile'),
  })
  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-2xl font-bold mb-6">Edit Profile</h2>
      <div className="space-y-4">
        {[['name','Full Name','text'],['country','Country','text'],['skills','Skills (comma separated)','text'],['experience','Years of Experience','text'],['linkedinUrl','LinkedIn URL','url'],['portfolioUrl','Portfolio URL','url']].map(([key, label, type]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className="input" />
          </div>
        ))}
        <button onClick={() => mutate(form)} disabled={isPending} className="btn-primary w-full justify-center mt-2">
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function SavedJobs() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['saved-jobs'], queryFn: () => api.get('/users/saved-jobs').then(r => r.data) })
  const unsave = (jobId) => qc.setQueryData(['saved-jobs'], old => ({ ...old, saved: old.saved.filter(s => s.jobId !== jobId) }))
  if (isLoading) return <div className="animate-pulse space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-32 bg-white/[0.03] rounded-2xl" />)}</div>
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6">Saved Jobs ({data?.saved?.length || 0})</h2>
      {data?.saved?.length === 0 ? <p className="text-white/40">No saved jobs yet. Browse jobs and bookmark ones you like.</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data?.saved?.map(s => !s.job.expired && <JobCard key={s.id} job={s.job} saved onUnsave={unsave} />)}
        </div>
      )}
    </div>
  )
}

function CVTool() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const upload = async () => {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('cv', file)
    try {
      const { data } = await api.post('/cv/upload', fd)
      setResult(data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Upload failed')
    } finally { setLoading(false) }
  }

  const scoreColor = result ? (result.score >= 70 ? 'text-emerald-light' : result.score >= 40 ? 'text-yellow-400' : 'text-red-400') : ''
  const pct = result ? Math.min(100, result.score) : 0

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl font-bold mb-2">CV ATS Checker</h2>
      <p className="text-white/40 text-sm mb-6">Upload your CV (PDF or DOCX) to get your ATS score and improvement tips. 100% free.</p>

      {!result ? (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">📄</div>
          <label className="block mb-4">
            <span className="btn-secondary cursor-pointer">Choose CV File</span>
            <input type="file" accept=".pdf,.docx,.doc" onChange={e => setFile(e.target.files[0])} className="hidden" />
          </label>
          {file && <p className="text-sm text-white/50 mb-4">{file.name}</p>}
          <button onClick={upload} disabled={!file || loading} className="btn-primary w-full justify-center">
            {loading ? 'Analysing...' : '🔍 Analyse My CV'}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#046A38" strokeWidth="3"
                    strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center font-serif font-bold text-xl ${scoreColor}`}>{result.score}</span>
              </div>
              <div>
                <div className="font-serif font-bold text-xl mb-1">ATS Score</div>
                <p className={`text-sm font-medium ${scoreColor}`}>{result.message}</p>
              </div>
            </div>
          </div>

          {result.missingKeywords?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold mb-3 text-red-400">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map(kw => <span key={kw} className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-3 py-1 rounded-full">{kw}</span>)}
              </div>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold mb-3">Suggestions</h3>
              <ul className="space-y-2">
                {result.suggestions.map((s,i) => <li key={i} className="text-sm text-white/60 flex gap-2"><span className="text-gold shrink-0">•</span>{s}</li>)}
              </ul>
            </div>
          )}

          <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full justify-center">Analyse Another CV</button>
        </div>
      )}
    </div>
  )
}

function MyProjects() {
  const { data, isLoading } = useQuery({ queryKey: ['my-projects'], queryFn: () => api.get('/projects/my/list').then(r => r.data) })
  const statusColors = { PENDING: 'text-yellow-400', APPROVED: 'text-emerald-light', REJECTED: 'text-red-400' }
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6">My Projects</h2>
      <NavLink to="/projects" className="btn-secondary text-sm mb-5 inline-flex">+ Post New Project</NavLink>
      {isLoading ? <div className="animate-pulse h-40 bg-white/[0.03] rounded-2xl" /> :
       !data?.projects?.length ? <p className="text-white/40">No projects yet.</p> :
       <div className="space-y-3">
         {data.projects.map(p => (
           <div key={p.id} className="card p-5 flex items-center justify-between gap-4">
             <div className="min-w-0">
               <div className="font-semibold text-white truncate">{p.title}</div>
               <div className="text-xs text-white/40 mt-1">{p.skills}</div>
             </div>
             <span className={`text-xs font-bold uppercase ${statusColors[p.status]}`}>{p.status}</span>
           </div>
         ))}
       </div>
      }
    </div>
  )
}

function JobAlerts() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['alerts'], queryFn: () => api.get('/alerts').then(r => r.data) })
  const [form, setForm] = useState({ categories: [], keywords: '', jobTypes: [], frequency: 'daily' })
  const CATEGORIES = ['Administrative','HR','Operations','Customer Support','Virtual Assistant','Tech','Entry-Level','Retail']
  const JOB_TYPES = ['Remote','Contract','Freelance','Hybrid']
  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const { mutate } = useMutation({
    mutationFn: () => api.post('/alerts', { ...form, keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean) }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['alerts']); toast.success('Alert created!'); setForm({ categories: [], keywords: '', jobTypes: [], frequency: 'daily' }) },
  })
  const del = async (id) => { await api.delete(`/alerts/${id}`); qc.invalidateQueries(['alerts']); toast.success('Alert removed') }

  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-2xl font-bold mb-6">Job Alerts</h2>
      <div className="card p-6 mb-6 space-y-4">
        <div>
          <label className="label">Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => <button key={c} type="button" onClick={() => setForm({...form, categories: toggle(form.categories, c)})}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${form.categories.includes(c) ? 'bg-emerald border-emerald text-white' : 'border-white/10 text-white/50 hover:border-emerald/40'}`}>{c}</button>)}
          </div>
        </div>
        <div>
          <label className="label">Keywords (comma separated)</label>
          <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="input text-sm" placeholder="e.g. Python, React, remote" />
        </div>
        <div>
          <label className="label">Frequency</label>
          <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="input">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <button onClick={() => mutate()} className="btn-primary w-full justify-center">Create Alert</button>
      </div>
      {data?.alerts?.length > 0 && (
        <div className="space-y-3">
          {data.alerts.map(a => (
            <div key={a.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="text-sm text-white/60">{a.categories || 'All'} · {a.frequency}</div>
              <button onClick={() => del(a.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  return (
    <>
      <Helmet><title>Dashboard — Ndlovukazi</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-white/40 text-sm mt-1">Manage your jobs, CV, projects and alerts</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar tabs */}
          <aside className="lg:w-52 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {tabs.map(({ to, icon: Icon, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive ? 'bg-emerald/20 text-white border border-emerald/30' : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                    }`
                  }>
                  <Icon size={15} /> {label}
                </NavLink>
              ))}
            </nav>
          </aside>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="profile" element={<Profile />} />
              <Route path="saved" element={<SavedJobs />} />
              <Route path="cv" element={<CVTool />} />
              <Route path="projects" element={<MyProjects />} />
              <Route path="alerts" element={<JobAlerts />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  )
}
