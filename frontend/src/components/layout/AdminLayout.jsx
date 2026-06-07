import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Briefcase, FolderKanban, Users, Flag, BookOpen, LogOut, Home } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/flagged', icon: Flag, label: 'Flagged Jobs' },
  { to: '/admin/blog', icon: BookOpen, label: 'Blog' },
]

export default function AdminLayout() {
  const { logout, user } = useAuthStore()
  return (
    <div className="min-h-screen flex bg-brand-black">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#0d0d0d] border-r border-white/[0.07] flex flex-col">
        <div className="p-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-gold flex items-center justify-center text-white font-black text-sm font-serif">N</div>
            <div>
              <div className="text-xs font-bold text-white">Ndlovukazi</div>
              <div className="text-[0.65rem] text-gold">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-emerald/20 text-white border border-emerald/30' : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                }`
              }>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.07] space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-all">
            <Home size={16} /> View Site
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/[0.07] px-6 flex items-center justify-between">
          <h1 className="text-sm font-medium text-white/60">Admin Panel</h1>
          <span className="text-sm text-white/40">{user?.name}</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
