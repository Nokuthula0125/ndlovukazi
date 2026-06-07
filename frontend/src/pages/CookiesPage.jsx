import { Helmet } from 'react-helmet-async'

export default function CookiesPage() {
  return (<>
    <Helmet><title>Cookie Policy — Ndlovukazi</title></Helmet>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-4xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: January 2025</p>
      <div className="space-y-8 text-white/70 leading-relaxed text-sm">
        {[
          ['What Are Cookies', 'Cookies are small text files stored in your browser. They help us keep you signed in and understand how you use the platform.'],
          ['Essential Cookies', 'Required for the platform to function (authentication tokens, session data). Cannot be disabled.'],
          ['Analytics Cookies', 'Google Analytics helps us understand which features are most useful. These are optional and can be declined via the cookie banner.'],
          ['How to Manage Cookies', 'Use the cookie banner to accept or decline optional cookies. You can also clear cookies via your browser settings.'],
          ['Contact', 'Cookie questions: nokuthulandlovu717@gmail.com'],
        ].map(([title, body]) => (
          <div key={title}>
            <h2 className="font-serif text-xl font-bold text-white mb-2">{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </div>
  </>)
}
