import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Plus, Calendar, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const nav = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title:'',description:'',budget:'',skills:'',duration:'' })
  const { data } = useQuery({ queryKey:['projects',search], queryFn:()=>api.get('/projects',{params:{search}}).then(r=>r.data) })
  const { mutate } = useMutation({
    mutationFn: ()=>api.post('/projects',form).then(r=>r.data),
    onSuccess:()=>{ toast.success('Project submitted for review!'); setForm({title:'',description:'',budget:'',skills:'',duration:''}); setShowForm(false) },
    onError:()=>toast.error('Failed to post project')
  })
  return (<>
    <Helmet><title>Community Projects — Ndlovukazi</title></Helmet>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div><h1 className="font-serif text-4xl font-bold mb-2">Community Projects</h1><p className="text-white/50">Collaborate, build, and earn</p></div>
        <button onClick={()=>user ? setShowForm(!showForm) : nav('/login')} className="btn-primary text-sm"><Plus size={15}/>Post Project</button>
      </div>
      {showForm && (
        <div className="card p-6 mb-8 space-y-4">
          <h2 className="font-serif text-lg font-bold">Post a Project</h2>
          {[['title','Title'],['skills','Required Skills'],['budget','Budget (optional)'],['duration','Duration (optional)']].map(([k,l])=>(
            <div key={k}><label className="label">{l}</label><input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="input" required={k==='title'||k==='skills'}/></div>
          ))}
          <div><label className="label">Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="input resize-none h-28" required/></div>
          <div className="flex gap-3"><button onClick={()=>mutate()} className="btn-primary">Submit</button><button onClick={()=>setShowForm(false)} className="btn-ghost">Cancel</button></div>
        </div>
      )}
      <input value={search} onChange={e=>setSearch(e.target.value)} className="input mb-6 max-w-sm text-sm" placeholder="Search projects..."/>
      <div className="space-y-4">
        {data?.projects?.map(p=>(
          <Link key={p.id} to={`/projects/${p.id}`} className="card p-6 block hover:border-emerald/30">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-serif font-bold text-xl text-white">{p.title}</h3>
              {p.budget && <span className="flex items-center gap-1 text-emerald-light font-semibold shrink-0"><DollarSign size={13}/>{p.budget}</span>}
            </div>
            <p className="text-white/50 text-sm line-clamp-2 mb-4">{p.description}</p>
            <div className="flex items-center justify-between text-xs text-white/30">
              <span>{p.skills}</span>
              <span className="flex items-center gap-1"><Calendar size={11}/>{formatDistanceToNow(new Date(p.createdAt),{addSuffix:true})}</span>
            </div>
          </Link>
        ))}
        {data?.projects?.length===0 && <p className="text-center text-white/40 py-12">No projects yet. Be the first!</p>}
      </div>
    </div>
  </>)
}
