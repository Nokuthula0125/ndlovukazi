import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import JobCard from '../components/jobs/JobCard'

const CATEGORIES = ['Administrative','HR','Operations','Retail','Customer Support','Virtual Assistant','Tech','Entry-Level']
const JOB_TYPES  = ['Remote','On-site','Hybrid','Contract','Freelance']
const REGIONS    = ['Worldwide','Africa','South Africa','Europe','Americas','Asia']
const SORTS      = [['newest','Newest First'],['salary','Salary'],['company','Company A-Z']]

export default function JobsPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')

  const q = {
    page:     Number(params.get('page')  || 1),
    category: params.get('category') || '',
    jobType:  params.get('jobType')  || '',
    region:   params.get('region')   || '',
    sort:     params.get('sort')     || 'newest',
    search:   params.get('search')   || '',
  }

  const set = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  useEffect(() => {
    const t = setTimeout(() => set('search', search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', q],
    queryFn: () => api.get('/jobs', { params: q }).then(r => r.data),
    keepPreviousData: true,
  })

  return (
    <>
      <Helmet>
        <title>Remote Jobs — Ndlovukazi</title>
        <meta name="description" content="Browse verified remote job opportunities for African professionals." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">Remote Jobs</h1>
          <p className="text-white/50">{data?.total?.toLocaleString() || '...'} verified opportunities, updated every 6 hours</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-11 text-base h-14"
            placeholder="Search jobs, companies, skills..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {/* Category chips */}
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => set('category', q.category === c ? '' : c)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                q.category === c ? 'bg-emerald border-emerald text-white' : 'border-white/10 text-white/50 hover:border-emerald/40 hover:text-white'
              }`}>{c}</button>
          ))}

          {/* Job type */}
          <select value={q.jobType} onChange={e => set('jobType', e.target.value)}
            className="bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:border-emerald/40">
            <option value="">All Types</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Region */}
          <select value={q.region} onChange={e => set('region', e.target.value)}
            className="bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:border-emerald/40">
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Sort */}
          <select value={q.sort} onChange={e => set('sort', e.target.value)}
            className="bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:border-emerald/40 ml-auto">
            {SORTS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(9)].map((_,i) => <div key={i} className="card h-52 animate-pulse bg-white/[0.03]" />)}
          </div>
        ) : data?.jobs?.length === 0 ? (
          <div className="text-center py-24 text-white/40">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium mb-2">No jobs found</p>
            <p className="text-sm">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data?.jobs?.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button onClick={() => set('page', String(q.page - 1))} disabled={q.page <= 1}
              className="p-2 rounded-lg border border-white/10 hover:border-emerald/40 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-white/60">Page {q.page} of {data.pages}</span>
            <button onClick={() => set('page', String(q.page + 1))} disabled={q.page >= data.pages}
              className="p-2 rounded-lg border border-white/10 hover:border-emerald/40 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
