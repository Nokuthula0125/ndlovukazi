import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, Briefcase, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import CookieBanner from '../ui/CookieBanner'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scam banner */}
      <div className="scam-banner">
        ⚠️ NEVER PAY FOR A JOB — We never ask for money. <Link to="/contact" className="underline text-yellow-300">Report suspicious listings</Link>
      </div>

      {/* Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-brand-black/95 backdrop-blur-lg border-b border-white/[0.08]' : 'bg-brand-black'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-gold flex items-center justify-center text-white font-black text-sm font-serif">N</div>
            <span className="font-serif font-bold text-white hidden sm:block">Ndlovukazi</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="nav-link">Jobs</Link>
            <Link to="/projects" className="nav-link">Projects</Link>
            <Link to="/blog" className="nav-link">Blog</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="nav-link flex items-center gap-1.5 text-gold">
                    <Shield size={14} /> Admin
                  </Link>
                )}
                <Link to="/dashboard" className="nav-link flex items-center gap-1.5">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <button onClick={logout} className="btn-ghost text-xs">
                  <LogOut size={14} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-white/70 hover:text-white p-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-brand-black/98 px-4 py-4 flex flex-col gap-3">
            <Link to="/jobs" className="nav-link py-2">Jobs</Link>
            <Link to="/projects" className="nav-link py-2">Projects</Link>
            <Link to="/blog" className="nav-link py-2">Blog</Link>
            <Link to="/contact" className="nav-link py-2">Contact</Link>
            <hr className="border-white/10" />
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link py-2">Dashboard</Link>
                {user.role === 'ADMIN' && <Link to="/admin" className="nav-link py-2 text-gold">Admin Panel</Link>}
                <button onClick={logout} className="text-left nav-link py-2">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link py-2">Sign in</Link>
                <Link to="/register" className="btn-primary w-full justify-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/[0.07] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-gold flex items-center justify-center text-white font-black text-sm font-serif">N</div>
                <span className="font-serif font-bold text-white">Ndlovukazi</span>
              </Link>
              <p className="text-sm text-white/40 leading-relaxed mb-5">
                Africa's most trusted remote job platform. Verified listings, AI tools, and a community built to uplift.
              </p>
              <a href="https://ko-fi.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-gold/30 text-gold text-sm px-4 py-2 rounded-lg hover:bg-gold/10 transition-colors">
                ☕ Buy Nokuthula a Coffee
              </a>
            </div>

            {/* Jobs */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.1em] uppercase text-white/30 mb-4">Jobs</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                {[['Browse Jobs','/jobs'],['Remote Jobs','/jobs?jobType=Remote'],['Entry-Level','/jobs?category=Entry-Level'],['Tech Jobs','/jobs?category=Tech'],['Job Alerts','/dashboard']].map(([label,to]) => (
                  <li key={to}><Link to={to} className="hover:text-gold transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.1em] uppercase text-white/30 mb-4">Tools</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                {[['AI Cover Letter','/jobs'],['CV ATS Checker','/dashboard'],['Community Projects','/projects'],['Blog','/blog']].map(([label,to]) => (
                  <li key={to}><Link to={to} className="hover:text-gold transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.1em] uppercase text-white/30 mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-gold transition-colors">Cookie Policy</Link></li>
                <li><a href="mailto:nokuthulandlovu717@gmail.com" className="hover:text-gold transition-colors">📧 Email Us</a></li>
                <li><a href="https://facebook.com/NokuthulaPreciousNdlovukazi" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Facebook</a></li>
                <li><a href="https://linkedin.com/in/nokuthulapreciousndlovu" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} Remote Jobs with Ndlovukazi. Founded by Nokuthula Precious Ndlovu.</p>
            <p className="text-xs text-white/25">⚠️ Never pay for a job. Report scams immediately.</p>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  )
}
