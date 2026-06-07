import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const { data, refetch } = useQuery({ queryKey:['project',id], queryFn:()=>api.get(`/projects/${id}`).then(r=>r.data) })
  const { mutate, isPending } = useMutation({
    mutationFn:()=>api.post(`/projects/${id}/apply`,{message:'I am interested in this project'}).then(r=>r.data),
    onSuccess:()=>{ toast.success('Application submitted!'); refetch() },
    onError:(e)=>toast.error(e.response?.data?.error||'Failed to apply')
  })
  const p = data?.project
  if (!p) return <div className="max-w-3xl mx-auto px-4 py-20 animate-pulse"><div className="h-8 bg-white/[0.05] rounded mb-4 w-1/2"/><div className="h-64 bg-white/[0.03] rounded"/></div>
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/projects" className="btn-ghost mb-6 -ml-2 text-sm"><ArrowLeft size={15}/>Back</Link>
      <div className="card p-8">
        <h1 className="font-serif text-3xl font-bold mb-2">{p.title}</h1>
        <p className="text-gold text-sm mb-6">By {p.user?.name}</p>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          {p.budget && <div><span className="text-white/40">Budget:</span> <span className="text-emerald-light font-semibold">{p.budget}</span></div>}
          {p.duration && <div><span className="text-white/40">Duration:</span> <span>{p.duration}</span></div>}
          <div className="col-span-2"><span className="text-white/40">Skills:</span> <span>{p.skills}</span></div>
        </div>
        <div className="text-white/70 leading-relaxed mb-8 whitespace-pre-wrap">{p.description}</div>
        {user && user.id !== p.userId && !data?.hasApplied && (
          <button onClick={()=>mutate()} disabled={isPending} className="btn-primary">{isPending?'Applying...':'Apply to Project'}</button>
        )}
        {data?.hasApplied && <span className="text-emerald-light text-sm font-medium">✓ Application submitted</span>}
        {!user && <Link to="/login" className="btn-primary">Sign in to Apply</Link>}
      </div>
    </div>
  )
}
