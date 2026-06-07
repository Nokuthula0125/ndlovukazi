import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Trash2, CheckCircle, Star, AlertTriangle, Plus } from 'lucide-react'

const CATEGORIES = ['Administrative','HR','Operations','Retail','Customer Support','Virtual Assistant','Tech','Entry-Level']
const JOB_TYPES  = ['Remote','On-site','Hybrid','Contract','Freelance']
const blank = { title:'',company:'',location:'',salary:'',category:'Tech',jobType:'Remote',description:'',sourceUrl:'' }

export default function AdminJobs() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', search],
    queryFn: () => api.get('/admin/jobs', { params: { search } }).then(r => r.data),
  })

  const patch = async (id, payload) => {
    await api.patch(`/admin/jobs/${id}`, payload)
    qc.invalidateQueries(['admin-jobs'])
    toast.success('Job updated')
  }

  const del = async (id) => {
    if (!confirm('Delete this job?')) return
    await api.delete(`/admin/jobs/${id}`)
    qc.invalidateQueries(['admin-jobs'])
    toast.success('Job deleted')
  }

  const create = async (e) => {
    e.preventDefault()
    await api.post('/admin/jobs', form)
    qc.invalidateQueries(['admin-jobs'])
    toast.success('Job posted!')
    setForm(blank); setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Manage Jobs</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          <Plus size={15} /> Post Job
        </button>
      </div>

      {/* Post form */}
      {showForm && (
        <form onSubmit={create} className="card p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="font-serif text-lg font-bold col-span-full">New Job</h2>
          {[['title','Title'],['company','Company'],['location','Location'],['salary','Salary'],['sourceUrl','External URL']].map(([k,l]) => (
            <div key={k}><label className="label text-xs">{l}</label>
              <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} className="input text-sm" required={k!=='salary'&&k!=='sourceUrl'} /></div>
          ))}
          <div><label className="label text-xs">Category</label>
            <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="input text-sm">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label text-xs">Job Type</label>
            <select value={form.jobType} onChange={e => setForm({...form,jobType:e.target.value})} className="input text-sm">
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="col-span-full"><label className="label text-xs">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="input resize-none h-28 text-sm" required /></div>
          <div className="col-span-full flex gap-3">
            <button type="submit" className="btn-primary">Post Job</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} className="input max-w-xs text-sm" placeholder="Search jobs..." />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.07] text-white/40 text-xs uppercase tracking-wide">
            <tr>{['Title','Company','Type','Source','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30">Loading...</td></tr> :
             data?.jobs?.map(j => (
              <tr key={j.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-4 py-3"><div className="font-medium truncate max-w-[200px]">{j.title}</div></td>
                <td className="px-4 py-3 text-white/50">{j.company}</td>
                <td className="px-4 py-3"><span className="badge badge-remote">{j.jobType}</span></td>
                <td className="px-4 py-3 text-white/40 text-xs">{j.source}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {j.verified && <span className="badge badge-verified">✓</span>}
                    {j.sponsored && <span className="badge badge-sponsored">★</span>}
                    {j.expired && <span className="badge text-white/30 bg-white/5">expired</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => patch(j.id, { verified: !j.verified })} title="Toggle verified" className={`p-1 rounded transition-colors ${j.verified ? 'text-emerald-light' : 'text-white/30 hover:text-emerald-light'}`}><CheckCircle size={15} /></button>
                    <button onClick={() => patch(j.id, { sponsored: !j.sponsored })} title="Toggle sponsored" className={`p-1 rounded transition-colors ${j.sponsored ? 'text-gold' : 'text-white/30 hover:text-gold'}`}><Star size={15} /></button>
                    <button onClick={() => patch(j.id, { expired: true })} title="Mark as scam/expired" className="p-1 text-white/30 hover:text-red-400 rounded transition-colors"><AlertTriangle size={15} /></button>
                    <button onClick={() => del(j.id)} className="p-1 text-white/30 hover:text-red-400 rounded transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
