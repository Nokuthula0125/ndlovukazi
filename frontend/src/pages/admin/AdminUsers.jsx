import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Ban, Trash2 } from 'lucide-react'

export default function AdminUsers() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.get('/admin/users').then(r => r.data) })
  const patch = async (id, payload) => { await api.patch(`/admin/users/${id}`, payload); qc.invalidateQueries(['admin-users']); toast.success('User updated') }
  const del = async (id) => { if (!confirm('Delete user?')) return; await api.delete(`/admin/users/${id}`); qc.invalidateQueries(['admin-users']); toast.success('Deleted') }
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Manage Users</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.07] text-white/40 text-xs uppercase tracking-wide">
            <tr>{['Name','Email','Role','Status','Joined','Actions'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {data?.users?.map(u => (
              <tr key={u.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-white/50 text-xs">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold ${u.role === 'ADMIN' ? 'text-gold' : 'text-white/40'}`}>{u.role}</span></td>
                <td className="px-4 py-3"><span className={`text-xs font-bold ${u.suspended ? 'text-red-400' : 'text-emerald-light'}`}>{u.suspended ? 'Suspended' : 'Active'}</span></td>
                <td className="px-4 py-3 text-white/30 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => patch(u.id, { suspended: !u.suspended })} className={`p-1 rounded transition-colors ${u.suspended ? 'text-emerald-light' : 'text-white/30 hover:text-yellow-400'}`}><Ban size={15}/></button>
                    <button onClick={() => del(u.id)} className="p-1 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={15}/></button>
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
