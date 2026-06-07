import { useState } from 'react'
import { X, Copy, Check, Sparkles, Loader } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function CoverLetterModal({ job, onClose }) {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [letter, setLetter] = useState(null)
  const [fallback, setFallback] = useState(false)
  const [copied, setCopied] = useState(false)
  const [background, setBackground] = useState('')

  const generate = async () => {
    setLoading(true)
    try {
      const { data } = await api.post(`/jobs/${job.id}/cover-letter`, {
        userName: user?.name,
        userBackground: background,
      })
      setLetter(data.coverLetter)
      setFallback(data.fallback)
    } catch {
      toast.error('Failed to generate cover letter')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald/20 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-light" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-lg">AI Cover Letter</h3>
              <p className="text-xs text-white/40">{job.title} at {job.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5">
          {!letter ? (
            <div className="space-y-4">
              {fallback && (
                <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-3 text-sm text-yellow-300">
                  ⚠️ Our AI is busy. Here is a cover letter template you can customise.
                </div>
              )}
              <div>
                <label className="label">Your background / key skills (optional)</label>
                <textarea
                  value={background}
                  onChange={e => setBackground(e.target.value)}
                  className="input resize-none h-24 text-sm"
                  placeholder="e.g. 3 years customer support, expert in Salesforce, fluent English..."
                />
              </div>
              <button onClick={generate} disabled={loading} className="btn-primary w-full justify-center">
                {loading ? <><Loader size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Cover Letter</>}
              </button>
              <p className="text-xs text-center text-white/30">Powered by Gemini 1.5 Flash · 100% Free</p>
            </div>
          ) : (
            <div>
              {fallback && (
                <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-3 text-sm text-yellow-300 mb-4">
                  ⚠️ Template provided — AI unavailable. Please customise before sending.
                </div>
              )}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-sans">
                {letter}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {letter && (
          <div className="p-5 border-t border-white/[0.08] flex gap-3">
            <button onClick={copy} className="btn-primary flex-1 justify-center">
              {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
            </button>
            <button onClick={() => setLetter(null)} className="btn-ghost">Regenerate</button>
          </div>
        )}
      </div>
    </div>
  )
}
