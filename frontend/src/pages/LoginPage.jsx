import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function AuthShell({ title, sub, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald to-gold flex items-center justify-center text-white font-black font-serif">N</div>
            <span className="font-serif font-bold text-white text-lg">Ndlovukazi</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold mb-2">{title}</h1>
          <p className="text-white/40 text-sm">{sub}</p>
        </div>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      nav(data.user.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Helmet><title>Sign In — Ndlovukazi</title></Helmet>
      <AuthShell title="Welcome back" sub="Sign in to your account">
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="input" required /></div>
          <div><label className="label">Password</label><input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} className="input" required /></div>
          <div className="text-right"><Link to="/forgot-password" className="text-xs text-gold hover:underline">Forgot password?</Link></div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="mt-5 pt-5 border-t border-white/[0.08]">
          <div className="grid grid-cols-2 gap-3">
            <a href="/api/auth/google" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-white/10 text-sm text-white/60 hover:bg-white/[0.05] transition">
              <span>G</span> Google
            </a>
            <a href="/api/auth/github" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-white/10 text-sm text-white/60 hover:bg-white/[0.05] transition">
              <span>⌥</span> GitHub
            </a>
          </div>
        </div>
        <p className="text-center text-sm text-white/40 mt-5">Don't have an account? <Link to="/register" className="text-gold hover:underline">Sign up free</Link></p>
      </AuthShell>
    </>
  )
}

export function RegisterPage() {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.token, data.user)
      toast.success('Account created! Welcome 🎉')
      nav('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Helmet><title>Create Account — Ndlovukazi</title></Helmet>
      <AuthShell title="Join Ndlovukazi" sub="Create your free account today">
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Full Name</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="input" required /></div>
          <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="input" required /></div>
          <div><label className="label">Password (min 8 chars)</label><input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} className="input" minLength={8} required /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">{loading ? 'Creating account...' : '🚀 Create Free Account'}</button>
        </form>
        <p className="text-center text-sm text-white/40 mt-5">Already have an account? <Link to="/login" className="text-gold hover:underline">Sign in</Link></p>
        <p className="text-center text-xs text-white/20 mt-3">By registering you agree to our <Link to="/terms" className="underline">Terms</Link></p>
      </AuthShell>
    </>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    await api.post('/auth/forgot-password', { email }).catch(() => {})
    setSent(true); setLoading(false)
  }

  return (
    <>
      <Helmet><title>Reset Password — Ndlovukazi</title></Helmet>
      <AuthShell title="Reset Password" sub="Enter your email to receive a reset link">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-white/70">If that email exists, a reset link has been sent.</p>
            <Link to="/login" className="btn-primary mt-5 inline-flex">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div><label className="label">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
        )}
      </AuthShell>
    </>
  )
}

export function ResetPasswordPage() {
  const nav = useNavigate()
  const token = new URLSearchParams(window.location.search).get('token')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('Password reset! Please sign in.'); nav('/login')
    } catch { toast.error('Invalid or expired token') }
    finally { setLoading(false) }
  }

  return (
    <>
      <Helmet><title>New Password — Ndlovukazi</title></Helmet>
      <AuthShell title="New Password" sub="Enter your new password">
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">New Password (min 8 chars)</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" minLength={8} required /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </AuthShell>
    </>
  )
}

export function OAuthCallbackPage() {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const token = new URLSearchParams(window.location.search).get('token')
  if (token) {
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { setAuth(token, data.user); nav('/dashboard') })
      .catch(() => nav('/login?error=oauth'))
  } else { nav('/login?error=oauth') }
  return <div className="min-h-screen flex items-center justify-center"><div className="text-white/50">Completing sign in...</div></div>
}

export default LoginPage
