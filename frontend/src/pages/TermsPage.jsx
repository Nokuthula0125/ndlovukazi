import { Helmet } from 'react-helmet-async'

export default function TermsPage() {
  return (<>
    <Helmet><title>Terms of Service — Ndlovukazi</title></Helmet>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: January 2025</p>
      <div className="space-y-8 text-white/70 leading-relaxed text-sm">
        {[
          ['1. Acceptance', 'By using Remote Jobs with Ndlovukazi, you agree to these terms. If you disagree, please do not use the platform.'],
          ['2. Free Service', 'This platform is free to use. We will NEVER charge job seekers for accessing jobs, cover letters, or CV tools.'],
          ['3. No Payment for Jobs', 'NEVER pay anyone claiming to be from Ndlovukazi or any employer listed here. Any request for payment is a scam. Report it immediately.'],
          ['4. User Accounts', 'You are responsible for maintaining your account security. Do not share your password. You must provide accurate information.'],
          ['5. Prohibited Conduct', 'You may not post fraudulent job listings, spam other users, scrape the platform, or use it for illegal purposes. Violations result in immediate account suspension.'],
          ['6. Job Listings', 'We curate listings from trusted sources but cannot guarantee accuracy. Always verify job details on the original employer website before applying.'],
          ['7. User Content', 'Projects and submissions you post must be genuine. Fake or misleading projects will be removed and your account suspended.'],
          ['8. Disclaimer', 'The platform is provided "as is". We are not liable for employment outcomes or disputes between users and employers.'],
          ['9. Changes', 'We may update these terms. Continued use constitutes acceptance of any changes.'],
          ['10. Contact', 'nokuthulandlovu717@gmail.com'],
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
