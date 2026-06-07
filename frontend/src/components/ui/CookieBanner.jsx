import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('cookie-consent') !== null
  )
  if (dismissed) return null

  const accept = () => { localStorage.setItem('cookie-consent', 'accepted'); setDismissed(true) }
  const decline = () => { localStorage.setItem('cookie-consent', 'declined'); setDismissed(true) }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-fade-up">
      <div className="bg-[#1e1e1e] border border-gold/20 rounded-2xl p-5 shadow-2xl">
        <p className="text-sm text-white/65 leading-relaxed mb-4">
          We use cookies to improve your experience. See our{' '}
          <Link to="/cookies" className="text-gold underline">Cookie Policy</Link>.
        </p>
        <div className="flex gap-2">
          <button onClick={accept} className="btn-primary text-sm py-2 px-4 flex-1 justify-center">Accept</button>
          <button onClick={decline} className="text-sm border border-white/15 text-white/50 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">Decline</button>
        </div>
      </div>
    </div>
  )
}
