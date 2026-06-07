import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'

export default function AdminProjects() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['admin-projects'], queryFn: () => api.get('/admin/projects').then(r => r.data) })
  const patch = async (id, status) => { await api.patch(`/admin/projects/${id}`, { status }); qc.invalidateQueries(['admin-projects']); toast.success(`Project ${status.toLowerCase()}`) }
  const del = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/admin/projects/${id}`); qc.invalidateQueries(['admin-projects']); toast.success('Deleted') }
  const colors = { PENDING: 'text-yellow-400', APPROVED: 'text-emerald-light', REJECTED: 'text-red-400' }
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Manage Projects</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.07] text-white/40 text-xs uppercase tracking-wide">
            <tr>{['Title','Author','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {data?.projects?.map(p => (
              <tr key={p.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium max-w-[220px] truncate">{p.title}</td>
                <td className="px-4 py-3 text-white/50 text-xs">{p.user?.name}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold uppercase ${colors[p.status]}`}>{p.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {p.status === 'PENDING' && <>
                      <button onClick={() => patch(p.id,'APPROVED')} className="p-1 text-white/30 hover:text-emerald-light transition-colors"><CheckCircle size={15}/></button>
                      <button onClick={() => patch(p.id,'REJECTED')} className="p-1 text-white/30 hover:text-red-400 transition-colors"><XCircle size={15}/></button>
                    </>}
                    <button onClick={() => del(p.id)} className="p-1 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={15}/></button>
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
