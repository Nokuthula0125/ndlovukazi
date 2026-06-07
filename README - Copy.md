# Remote Jobs with Ndlovukazi 🌍

**Africa's most trusted remote job platform.**  
Founded by **Nokuthula Precious Ndlovu** · [nokuthulandlovu717@gmail.com](mailto:nokuthulandlovu717@gmail.com)

[![Facebook](https://img.shields.io/badge/Facebook-Nokuthula%20Precious%20Ndlovukazi-blue)](https://facebook.com/NokuthulaPreciousNdlovukazi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nokuthula%20Precious%20Ndlovu-blue)](https://linkedin.com/in/nokuthulapreciousndlovu)

---

## 🚀 Features

| Feature | Status |
|---------|--------|
| Verified job listings (Remotive, RSS feeds) | ✅ |
| Live search + filters (category, type, region) | ✅ |
| AI Cover Letter Generator (Gemini 1.5 Flash) | ✅ |
| CV ATS Score Checker (PDF & DOCX) | ✅ |
| Community Projects board | ✅ |
| Job Alerts (daily/weekly email digest) | ✅ |
| Save jobs / Bookmark | ✅ |
| Report suspicious jobs (anti-scam) | ✅ |
| Google OAuth + GitHub OAuth | ✅ |
| Admin panel (jobs, users, projects, blog) | ✅ |
| Blog (admin-managed) | ✅ |
| Contact form | ✅ |
| GDPR cookie banner | ✅ |
| Schema.org JobPosting markup | ✅ |
| Mobile-first responsive design | ✅ |
| In-memory caching (1-hour TTL) | ✅ |
| Cron jobs (fetch every 6h, expire daily) | ✅ |
| SQLite (dev) / PostgreSQL (production) | ✅ |

---

## 📁 Project Structure

```
ndlovukazi/
├── backend/                    # Node.js + Express API
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (all models)
│   ├── src/
│   │   ├── server.js           # Express entry point
│   │   ├── routes/             # auth, jobs, cv, projects, admin, blog, alerts, contact
│   │   ├── services/           # jobFetcher, email, alerts
│   │   ├── jobs/               # cron.js (scheduled tasks)
│   │   ├── middleware/         # auth.js (JWT + admin guard)
│   │   └── utils/              # prisma, passport, cache, seed
│   ├── .env.example
│   ├── Dockerfile
│   ├── render.yaml             # Render deployment config
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── App.jsx             # Routes
│   │   ├── main.jsx            # Entry point
│   │   ├── components/
│   │   │   ├── layout/         # Layout, AdminLayout
│   │   │   ├── jobs/           # JobCard, CoverLetterModal
│   │   │   └── ui/             # CookieBanner
│   │   ├── pages/              # All page components
│   │   │   ├── admin/          # AdminDashboard, AdminJobs, etc.
│   │   │   └── *.jsx           # HomePage, JobsPage, DashboardPage, etc.
│   │   ├── store/              # Zustand auth store
│   │   ├── lib/                # Axios API client
│   │   └── styles/             # globals.css (Tailwind)
│   ├── .env.example
│   ├── vercel.json             # Vercel deployment config
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml          # Local dev with PostgreSQL
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/ndlovukazi.git
cd ndlovukazi
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — see API Keys section below
npm install
npx prisma generate
npx prisma db push       # Creates SQLite database
npm run seed             # Creates admin user + ATS keywords
npm run dev              # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
cp .env.example .env
# For local dev, VITE_API_URL can be left empty (Vite proxy handles it)
npm install
npm run dev              # Starts on http://localhost:5173
```

### 4. Add Founder Photo

Place `founder.jpg` in `frontend/public/` — this is Nokuthula's photo shown in the hero section.

Open [http://localhost:5173](http://localhost:5173) — the site is live! 🎉

---

## 🔑 API Keys — Where to Get Them

### Required for full functionality:

#### 1. Gemini API (AI Cover Letters) — FREE
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy and add to backend `.env`:
   ```
   GEMINI_API_KEY=AIza...
   ```

#### 2. Resend (Email) — FREE tier: 3,000 emails/month
1. Go to [https://resend.com](https://resend.com) and sign up
2. Go to **API Keys** → **Create API Key**
3. Copy and add to backend `.env`:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=noreply@yourdomain.com
   ```
   > **Note:** To send from a custom domain, verify it in Resend dashboard. For testing, use `onboarding@resend.dev`.

#### 3. Google OAuth — FREE
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → **APIs & Services** → **Credentials**
3. Click **"Create Credentials"** → **OAuth 2.0 Client IDs**
4. Application type: **Web application**
5. Authorised redirect URIs: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

#### 4. GitHub OAuth — FREE
1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Click **"New OAuth App"**
3. Homepage URL: `http://localhost:5173`
4. Callback URL: `http://localhost:5000/api/auth/github/callback`
5. Copy Client ID and Secret to `.env`:
   ```
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   ```

#### 5. Google Analytics 4 — FREE (optional)
1. Go to [https://analytics.google.com](https://analytics.google.com)
2. Create a property → Get Measurement ID (`G-XXXXXXXXXX`)
3. Uncomment the GA script in `frontend/index.html` and replace the placeholder ID

#### 6. Facebook Pixel — FREE (optional)
1. Go to [Meta Business Manager](https://business.facebook.com)
2. Events Manager → Create Pixel → Get Pixel ID
3. Uncomment the FB Pixel script in `frontend/index.html`

---

## 👑 Admin Account

After running `npm run seed`, the admin account is:

| Field | Value |
|-------|-------|
| Email | `admin@ndlovukazi.com` |
| Password | `Admin@Ndlovukazi2025!` |

**⚠️ Change the admin password immediately after first login in production!**

Set custom credentials in `backend/.env`:
```
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_NAME=Your Name
```

### Admin Capabilities:
- **Dashboard** — user count, active jobs, flagged reports, popular jobs
- **Jobs** — verify, sponsor, mark as expired/scam, manually post jobs
- **Projects** — approve or reject community project submissions
- **Users** — suspend or delete accounts
- **Flagged Jobs** — review reports, mark as scam (auto-hides job)
- **Blog** — create and publish blog posts

---

## 🌐 Deployment

### Frontend → Vercel (FREE)

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) and import the repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL = https://your-backend.onrender.com/api
   ```
5. Deploy — Vercel auto-detects Vite

### Backend → Render (FREE)

1. Go to [https://render.com](https://render.com) and connect GitHub
2. Click **"New"** → **"Web Service"**
3. Set **Root Directory** to `backend`
4. Render will use `render.yaml` automatically
5. Set environment variables in Render dashboard:
   - `RESEND_API_KEY`
   - `GEMINI_API_KEY`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
   - `ADMIN_PASSWORD`
   - `FRONTEND_URL` = your Vercel URL
6. Create a **PostgreSQL** database in Render (free tier)
7. Link it to the web service — `DATABASE_URL` is auto-set

> **Important:** Update OAuth callback URLs in Google/GitHub to use your production Render URL after deployment.

### Production OAuth Callback URLs

After deploying to Render, update:
- **Google Cloud Console**: Add `https://your-api.onrender.com/api/auth/google/callback`
- **GitHub OAuth App**: Change callback to `https://your-api.onrender.com/api/auth/github/callback`

---

## 💰 Monetisation Setup

### Google AdSense
1. Apply at [https://adsense.google.com](https://adsense.google.com)
2. Once approved, add your AdSense script to `frontend/index.html`
3. Add ad units in the sidebar and between job cards in `JobsPage.jsx`

### Sponsored Jobs (Gold Border)
- In Admin Panel → Jobs → click the ⭐ star icon to toggle sponsored
- Sponsored jobs appear at the top with a gold border
- Collect payment manually from sponsors

### Donation Button
- Update the Ko-fi link in `Layout.jsx` footer with your Ko-fi username:
  ```
  https://ko-fi.com/YOUR_USERNAME
  ```
- Or use PayPal: `https://paypal.me/YOUR_USERNAME`

---

## 🐳 Docker (Local with PostgreSQL)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Run seed inside container
docker-compose exec backend npm run seed

# Stop all
docker-compose down
```

---

## 📧 Email Templates

All emails are sent via Resend. Templates are in `backend/src/services/email.js`:

| Template | Trigger |
|----------|---------|
| Welcome email | User registers |
| Password reset | Forgot password |
| Job alert digest | Daily/weekly cron |
| Flag notification | User reports a job |
| Contact message | Contact form submitted |

---

## 🔄 Cron Jobs

| Schedule | Task |
|----------|------|
| Every 6 hours | Fetch jobs from Remotive API + RSS feeds |
| Daily at 2:00 AM | Mark 30-day-old jobs as expired; delete 60-day-old |
| Daily at 8:00 AM | Send daily job alert emails |
| Every Monday 9:00 AM | Send weekly job alert emails |
| On startup (after 3s) | Initial job fetch |

---

## 🛡️ Anti-Scam Features

- **Banner** on every page: "NEVER PAY FOR A JOB"
- **Report button** on every job detail page (logged-in users)
- **Flagged Jobs admin panel**: review, mark as scam (auto-hides), or dismiss
- **Email notification** to founder when a job is flagged
- **Verified badge**: green badge on Remotive, RSS, and admin-posted jobs

---

## 🗄️ Database Schema Overview

| Model | Description |
|-------|-------------|
| `User` | Accounts (email/OAuth, role: USER/ADMIN) |
| `Job` | All job listings with deduplication |
| `SavedJob` | User bookmarks |
| `FlaggedJob` | Reported suspicious jobs |
| `Project` | Community project postings |
| `Application` | Project applications |
| `JobAlert` | Email subscription preferences |
| `BlogPost` | Admin-written blog posts |
| `CvUpload` | CV analysis history |
| `AtsKeyword` | Admin-configurable ATS keywords |
| `ContactMessage` | Contact form submissions |

---

## 🔧 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_PROVIDER` | `sqlite` or `postgresql` | ✅ |
| `DATABASE_URL` | Database connection string | ✅ |
| `JWT_SECRET` | Long random string for JWT signing | ✅ |
| `FRONTEND_URL` | Your frontend URL (for CORS + emails) | ✅ |
| `RESEND_API_KEY` | Resend API key for emails | Recommended |
| `GEMINI_API_KEY` | Google Gemini API key for AI letters | Recommended |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Optional |
| `ADMIN_EMAIL` | Admin account email | ✅ |
| `ADMIN_PASSWORD` | Admin account password | ✅ |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (empty = use Vite proxy) |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 ID (optional) |
| `VITE_FB_PIXEL_ID` | Facebook Pixel ID (optional) |

---

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Emerald | `#046A38` | Primary buttons, verified badges, accents |
| Gold | `#D4AF37` | Sponsored jobs, founder name, highlights |
| Black | `#111111` | Background |
| White | `#FFFFFF` | Text |

---

## 🙏 Credits

Built with ❤️ for **Nokuthula Precious Ndlovu** and Africa's remote workforce.

- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [Express.js](https://expressjs.com) + [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [Remotive API](https://remotive.com/api)
- [Google Gemini](https://aistudio.google.com)
- [Resend](https://resend.com)

---

*⚠️ NEVER PAY FOR A JOB. Report suspicious listings to [nokuthulandlovu717@gmail.com](mailto:nokuthulandlovu717@gmail.com)*
