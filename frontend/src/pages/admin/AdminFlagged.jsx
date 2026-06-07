import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { ShieldX, ShieldCheck } from 'lucide-react'

export default function AdminFlagged() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['admin-flagged'], queryFn: () => api.get('/admin/flagged').then(r => r.data) })
  const act = async (id, status) => { await api.patch(`/admin/flagged/${id}`, { status }); qc.invalidateQueries(['admin-flagged']); toast.success(status === 'SCAM' ? 'Marked as scam & hidden' : 'Dismissed') }
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Flagged Jobs <span className="text-red-400 text-lg ml-2">{data?.flagged?.length || 0}</span></h1>
      {!data?.flagged?.length ? <p className="text-white/40">No pending flags. 🎉</p> :
        <div className="space-y-3">
          {data.flagged.map(f => (
            <div key={f.id} className="card p-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{f.job?.title} <span className="text-white/40">at</span> {f.job?.company}</div>
                <div className="text-xs text-white/40 mt-1">Reported by {f.user?.name}: {f.reason || 'No reason given'}</div>
                {f.job?.sourceUrl && <a href={f.job.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline mt-1 block">View original</a>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => act(f.id, 'SCAM')} className="flex items-center gap-1.5 text-xs bg-red-500/15 text-red-400 border border-red-500/25 px-3 py-2 rounded-lg hover:bg-red-500/25 transition-colors"><ShieldX size={13}/> Mark Scam</button>
                <button onClick={() => act(f.id, 'DISMISSED')} className="flex items-center gap-1.5 text-xs bg-white/5 text-white/50 border border-white/10 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"><ShieldCheck size={13}/> Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}
