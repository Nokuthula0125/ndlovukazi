import { Helmet } from 'react-helmet-async'

export default function PrivacyPage() {
  return (<>
    <Helmet><title>Privacy Policy — Ndlovukazi</title></Helmet>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: January 2025</p>
      <div className="space-y-8 text-white/70 leading-relaxed text-sm">
        {[
          ['1. Information We Collect', 'We collect information you provide directly (name, email, CV files) and automatically (pages visited, job clicks). We do not sell your data to third parties.'],
          ['2. How We Use Your Data', 'We use your data to provide job listings, send job alert emails, generate ATS scores, and improve the platform. Emails are sent via Resend and are never shared.'],
          ['3. Data Storage', 'Your data is stored securely on encrypted servers. CV files are deleted immediately after analysis. We do not store raw CV content.'],
          ['4. Cookies', 'We use essential cookies for authentication and optional analytics cookies (Google Analytics). You can opt out via the cookie banner.'],
          ['5. Your Rights', 'You may request deletion of your account and data at any time by emailing nokuthulandlovu717@gmail.com. We will process requests within 30 days.'],
          ['6. Third-Party Services', 'We use Google OAuth, GitHub OAuth, Resend (email), and Google Analytics. Each has its own privacy policy.'],
          ['7. Children', 'This platform is not intended for users under 18. We do not knowingly collect data from minors.'],
          ['8. Contact', 'For privacy questions: nokuthulandlovu717@gmail.com'],
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
