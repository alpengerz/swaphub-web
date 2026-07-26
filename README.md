# SwapHub

Trade what you have for what you need. A barter marketplace (web + installable PWA) backed by Supabase.

**Live prototype (static UI):** https://swaphub-web.vercel.app  
**Repo:** https://github.com/pengmain2023/swaphub-web

## Stack

- Vite + React 18 + TypeScript + Tailwind
- Supabase (Auth, Postgres, Storage, Realtime)
- Vercel hosting + PWA (`vite-plugin-pwa`)

## Local setup (free)

### 1. Install & run

```bash
npm install
cp .env.example .env.local
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

### 2. Create a free Supabase project

1. Sign up at [supabase.com](https://supabase.com) → New project.
2. Open **SQL Editor** → paste and run  
   [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)  
   (creates tables, RLS, storage buckets, realtime).
3. **Authentication → Providers**
   - Enable **Email** (confirm email ON for production-like flow).
   - Enable **Google** (optional): create OAuth credentials in Google Cloud Console; set redirect to  
     `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. **Authentication → URL configuration**
   - Site URL: `http://localhost:5173` (dev) / your Vercel URL (prod)
   - Redirect URLs:  
     `http://localhost:5173/auth/callback`  
     `https://YOUR_VERCEL_DOMAIN/auth/callback`  
     `http://localhost:5173/verify-email`
5. **Project Settings → API** → copy Project URL + `anon` key into `.env.local`.

### 3. Registration flow

1. Welcome → **Get Started** → email/password **or** Continue with Google  
2. Verify email (if required)  
3. Complete profile (username, display name, city)  
4. Home feed → post listings, search, chat, make offers, confirm trades  

Phone SMS OTP is deferred (keeps the free tier free).

## Deploy (free now)

1. Push to GitHub (`pengmain2023/swaphub-web`).
2. In Vercel: import the repo (or `npx vercel --prod`).
3. Add env vars in Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Redeploy. SPA rewrites are in `vercel.json`.

Install as PWA: Chrome/Edge → “Install app” / Add to Home Screen.

## Go-live checklist (custom domain)

| Step | Action | Approx. cost |
|------|--------|----------------|
| 1 | Buy domain (`swaphub.ph` / `.com`) at Namecheap, Spaceship, etc. | ~₱1,000–1,500/yr |
| 2 | Vercel → Project → Domains → add domain (DNS A/CNAME as shown) | Free on Hobby |
| 3 | Upgrade Supabase to **Pro** so the DB never pauses | ~$25/mo |
| 4 | Supabase Auth: set Site URL + redirects to `https://yourdomain` | — |
| 5 | Google OAuth: add production redirect URIs | Free |
| 6 | Optional: custom SMTP / Resend for `noreply@yourdomain` | Free tier OK |
| 7 | Add Privacy Policy + Terms pages (PH Data Privacy Act awareness) | — |
| 8 | Optional: Sentry free for error tracking | Free |
| 9 | Phase 2: Expo native apps → App Store ($99/yr) + Play ($25 once) | Later |

**Recommended free → paid path:** stay on Vercel Hobby + Supabase Free while inviting testers; move Supabase to Pro + attach a domain before public launch.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview `dist/` |

## Project layout

```
src/
  auth/           AuthContext, route guards
  lib/            supabase, listings, chat, trades
  screens/        UI screens + auth/*
  types/          DB types
supabase/migrations/   SQL schema + RLS
```
