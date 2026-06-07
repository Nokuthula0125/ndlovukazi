import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'',email:'',message:'' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await api.post('/contact', form); setSent(true); toast.success('Message sent!') }
    catch { toast.error('Failed to send message') }
    finally { setLoading(false) }
  }
  return (<>
    <Helmet><title>Contact — Ndlovukazi</title></Helmet>
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-4xl font-bold mb-2">Contact Us</h1>
      <p className="text-white/40 mb-8">Get in touch with Nokuthula and the team</p>
      {sent ? (
        <div className="card p-10 text-center"><div className="text-5xl mb-4">📬</div><h2 className="font-serif text-2xl font-bold mb-2">Message Sent!</h2><p className="text-white/50">We'll get back to you at {form.email} soon.</p></div>
      ) : (
        <form onSubmit={submit} className="card p-8 space-y-4">
          <div><label className="label">Your Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input" required/></div>
          <div><label className="label">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input" required/></div>
          <div><label className="label">Message</label><textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="input resize-none h-36" required minLength={10}/></div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading?'Sending...':'Send Message 📬'}</button>
        </form>
      )}
      <div className="mt-8 text-center text-sm text-white/30">
        Or email directly: <a href="mailto:nokuthulandlovu717@gmail.com" className="text-gold hover:underline">nokuthulandlovu717@gmail.com</a>
      </div>
    </div>
  </>)
}
