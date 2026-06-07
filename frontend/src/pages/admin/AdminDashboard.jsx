import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Users, Briefcase, FolderKanban, Flag } from 'lucide-react'

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/admin/stats').then(r => r.data) })

  const stats = [
    { label: 'Total Users', value: data?.totalUsers, icon: <Users size={20} className="text-emerald-light" /> },
    { label: 'Active Jobs', value: data?.activeJobs, icon: <Briefcase size={20} className="text-gold" /> },
    { label: 'Projects', value: data?.totalProjects, icon: <FolderKanban size={20} className="text-blue-400" /> },
    { label: 'Pending Flags', value: data?.flagged, icon: <Flag size={20} className="text-red-400" /> },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">{s.icon}<span className="text-xs text-white/30 uppercase tracking-wide">{s.label}</span></div>
            <div className="font-serif text-3xl font-bold text-white">{s.value ?? '–'}</div>
          </div>
        ))}
      </div>

      {data?.popularJobs?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-serif text-lg font-bold mb-4">Most Popular Jobs</h2>
          <div className="space-y-2">
            {data.popularJobs.map(j => (
              <div key={j.id} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                <div>
                  <div className="text-sm font-medium">{j.title}</div>
                  <div className="text-xs text-white/40">{j.company}</div>
                </div>
                <div className="text-right text-xs text-white/40">
                  <div>{j.views} views</div>
                  <div className="text-gold">{j.clicks} clicks</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
