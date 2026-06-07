import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, Sparkles, FileText, Bell, Shield, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import JobCard from '../components/jobs/JobCard'

const CATEGORIES = [
  { name: 'Administrative', emoji: '💼', slug: 'Administrative' },
  { name: 'HR & Recruiting', emoji: '👥', slug: 'HR' },
  { name: 'Operations', emoji: '⚙️', slug: 'Operations' },
  { name: 'Customer Support', emoji: '🎧', slug: 'Customer Support' },
  { name: 'Virtual Assistant', emoji: '🧑‍💻', slug: 'Virtual Assistant' },
  { name: 'Tech', emoji: '💻', slug: 'Tech' },
  { name: 'Entry-Level', emoji: '🌱', slug: 'Entry-Level' },
  { name: 'Retail', emoji: '🛍️', slug: 'Retail' },
]

const FEATURES = [
  { icon: <Shield size={22} className="text-emerald-light" />, title: 'Verified Listings', desc: 'Every job sourced from trusted APIs and RSS feeds. Green badges on all verified listings. No duplicates.' },
  { icon: <Sparkles size={22} className="text-gold" />, title: 'AI Cover Letters', desc: 'Powered by Gemini 1.5 Flash. One click generates a tailored 300–400 word cover letter. Completely free.' },
  { icon: <FileText size={22} className="text-emerald-light" />, title: 'CV ATS Scorer', desc: 'Upload your CV. Get an ATS score 0–100, missing keywords, and formatting suggestions. Free forever.' },
  { icon: <Bell size={22} className="text-gold" />, title: 'Job Alert Emails', desc: 'Daily or weekly email digests of new jobs matching your category, skills, and preferences.' },
]

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ['jobs-featured'],
    queryFn: () => api.get('/jobs?limit=6&sort=newest').then(r => r.data),
  })

  return (
    <>
      <Helmet>
        <title>Remote Jobs with Ndlovukazi — Africa's Trusted Remote Job Platform</title>
        <meta name="description" content="Find verified remote jobs for African professionals. Free AI cover letters, ATS CV scoring, community projects." />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* bg glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-emerald/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-emerald/10 border border-emerald/30 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-light tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-light rounded-full animate-pulse" />
              Africa's Premier Remote Job Platform
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
              Remote Jobs<br />
              <span className="text-gold">with Ndlovukazi</span>
              <span className="block font-display italic font-light text-3xl text-white/50 mt-2">– work from anywhere</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-lg mb-8 font-light">
              Curated, verified remote opportunities for African professionals. AI-powered cover letters, ATS scoring, community projects — everything you need to land the job you deserve.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/jobs" className="btn-primary text-base px-7 py-3.5">
                🔍 Browse Jobs <ArrowRight size={16} />
              </Link>
              <Link to="/register" className="btn-secondary text-base px-7 py-3.5">
                Create Free Account
              </Link>
            </div>
            <div className="flex gap-10 pt-6 border-t border-white/[0.08]">
              {[['2,400+','Active Jobs'],['340+','Companies'],['100%','Free']].map(([num, label]) => (
                <div key={label}>
                  <div className="font-serif text-2xl font-bold text-gold">{num}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wide mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Founder photo */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in">
            <div className="relative w-72 sm:w-80 lg:w-96 aspect-[3/4]">
              {/* Morphing border */}
              <div className="absolute inset-[-16px] border border-gold/25 rounded-[40%_60%_55%_45%/45%_40%_60%_55%] animate-pulse-slow" />
              {/* Glow */}
              <div className="absolute inset-2 bg-emerald/30 blur-3xl rounded-full -z-10" />
              {/* Photo */}
              <div className="w-full h-full rounded-[30%_70%_60%_40%/50%_40%_60%_50%] overflow-hidden ring-2 ring-gold/30 shadow-2xl">
                <img
                  src="/founder.jpg"
                  alt="Nokuthula Precious Ndlovu – Founder"
                  className="w-full h-full object-cover object-top"
                  style={{ filter: 'contrast(1.05) saturate(0.9)' }}
                />
              </div>
              {/* Name badge */}
              <div className="absolute -bottom-4 -left-4 bg-[#1a1a1a] border border-gold/30 rounded-2xl px-4 py-3 shadow-xl">
                <div className="font-serif font-bold text-white text-sm">Nokuthula Ndlovu</div>
                <div className="text-gold text-xs mt-0.5">Founder & CEO</div>
              </div>
              <div className="absolute top-4 -right-4 bg-emerald/90 border border-emerald rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
                <Star size={11} fill="currentColor" /> Verified Platform
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOURCES BAR ── */}
      <div className="border-y border-white/[0.07] bg-white/[0.02] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <span className="text-xs text-white/25 uppercase tracking-widest font-semibold shrink-0">Job Sources</span>
          {['Remotive API','Working Nomads','Jobspresso','User Submitted','Admin Verified'].map(s => (
            <span key={s} className="flex items-center gap-1.5 text-sm text-white/45 hover:text-gold transition-colors">
              <span className="w-1.5 h-1.5 bg-emerald rounded-full" />{s}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="section-eyebrow">Why Choose Us</span>
          <h2 className="section-title mb-4">Everything you need to<br />land your remote role</h2>
          <p className="text-white/50 leading-relaxed">From job discovery to application — we've built the tools that give African professionals a real competitive edge.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-6 hover:border-emerald/30">
              <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center mb-5">{f.icon}</div>
              <h3 className="font-serif font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 px-4 sm:px-6 bg-emerald/[0.04] border-y border-emerald/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Browse by Category</span>
            <h2 className="section-title">Find your field</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(c => (
              <Link key={c.slug} to={`/jobs?category=${c.slug}`}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-center hover:bg-emerald/15 hover:border-emerald/40 hover:-translate-y-1 transition-all duration-200">
                <div className="text-2xl mb-2">{c.emoji}</div>
                <div className="text-xs font-semibold text-white/80">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST JOBS ── */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="section-eyebrow">Latest Opportunities</span>
            <h2 className="section-title">Fresh jobs, daily updates</h2>
          </div>
          <Link to="/jobs" className="btn-secondary text-sm hidden sm:flex">View all jobs <ArrowRight size={14} /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.jobs?.slice(0, 6).map(job => <JobCard key={job.id} job={job} />)}
          {!data && [...Array(6)].map((_, i) => (
            <div key={i} className="card h-52 animate-pulse bg-white/[0.03]" />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/jobs" className="btn-secondary">View all jobs <ArrowRight size={14} /></Link>
        </div>
      </section>

      {/* ── FOUNDER QUOTE ── */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[220px_1fr] gap-12 items-center">
          <div className="hidden md:block w-52 aspect-[3/4] rounded-2xl overflow-hidden ring-2 ring-gold/25 shadow-2xl">
            <img src="/founder.jpg" alt="Nokuthula" className="w-full h-full object-cover object-top" style={{ filter: 'saturate(0.85)' }} />
          </div>
          <div>
            <blockquote className="font-display italic text-3xl md:text-4xl text-white/90 leading-relaxed mb-6 relative pl-8">
              <span className="absolute left-0 top-0 text-6xl text-gold/30 font-serif leading-none">"</span>
              I built this platform because every African professional deserves access to legitimate, high-quality remote work — without ever paying a cent or falling victim to scams.
            </blockquote>
            <div className="font-serif font-bold text-white text-xl mb-1">Nokuthula Precious Ndlovu</div>
            <div className="text-gold text-sm mb-5">Founder, Remote Jobs with Ndlovukazi</div>
            <div className="flex gap-3">
              <a href="https://facebook.com/NokuthulaPreciousNdlovukazi" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.07] flex items-center justify-center text-white/60 hover:text-white hover:bg-emerald/25 transition-all text-xs font-bold">f</a>
              <a href="https://linkedin.com/in/nokuthulapreciousndlovu" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.07] flex items-center justify-center text-white/60 hover:text-white hover:bg-emerald/25 transition-all text-xs font-bold">in</a>
              <a href="mailto:nokuthulandlovu717@gmail.com"
                className="w-9 h-9 rounded-lg bg-white/[0.07] flex items-center justify-center text-white/60 hover:text-white hover:bg-emerald/25 transition-all text-xs">@</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-br from-emerald-dark via-emerald/80 to-emerald-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <span className="section-eyebrow text-white/50">Join 5,000+ Professionals</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-5">Your next remote role<br />is waiting for you</h2>
          <p className="text-white/70 text-lg mb-10">Create your free account, set up job alerts, and apply with an AI-generated cover letter today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-white text-emerald-dark font-bold px-8 py-4 rounded-lg hover:bg-white/90 transition inline-flex items-center gap-2">
              🚀 Create Free Account
            </Link>
            <Link to="/jobs" className="border border-white/30 text-white px-8 py-4 rounded-lg hover:bg-white/10 transition inline-flex items-center gap-2">
              Browse Jobs First
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
