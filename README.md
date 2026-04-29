# TechPulse — Daily Tech Intelligence Dashboard

A Next.js 15 SaaS for tech bloggers: auto-fetched articles across AI / marketing / research / society, saved to a personal library, with a Gemini-powered blog idea + full post generator.

Live deploy target: **https://tutor.theaihublab.com** (Hostinger subdomain → Vercel).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Database | **Supabase** (Postgres) |
| Auth | NextAuth — email magic link only |
| AI | **Google Gemini** (`gemini-2.0-flash` + `gemini-2.5-pro`) |
| Host | **Vercel** (primary) · Render.com (fallback) |
| Cron | Vercel Cron → `/api/refresh` daily at 06:00 UTC |

---

## Features

- Daily article feed from NewsAPI + RSS feeds + arXiv
- 6 categories: Tech Updates, AI, Digital Marketing, Social Media, Research, Tech & Human Life
- Personal library — save with notes + tags, search, export Markdown/CSV
- 1-click Gemini blog idea generator
- Full SEO-optimized blog post generator (title, meta, keywords, content, FAQ)
- Cmd+K global search
- Dark / light mode

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # fill in values — see DEPLOY.md step 1-4
npm run dev
```

Visit http://localhost:3000, then hit http://localhost:3000/api/refresh once to pull the first batch of articles.

---

## Deploy to `tutor.theaihublab.com`

See **[DEPLOY.md](DEPLOY.md)** — step-by-step walkthrough covering:
1. Supabase project + schema
2. Gemini + NewsAPI keys
3. SMTP for email magic-link
4. Vercel deploy
5. Hostinger cPanel DNS (CNAME) for the subdomain
6. SSL + propagation checks

---

## Project layout

```
techpulse/
├── app/
│   ├── dashboard/       — main feed + daily digest
│   ├── category/[slug]/ — per-category feed
│   ├── library/         — saved articles
│   ├── write/           — AI blog writer
│   ├── login/           — email magic-link sign-in
│   └── api/
│       ├── auth/        — NextAuth handler
│       ├── refresh/     — fetch + store articles (CRON)
│       ├── save/        — save/delete articles
│       ├── search/      — full-text search
│       ├── blog-idea/   — Gemini: quick idea
│       └── write-blog/  — Gemini: full blog post
├── components/          — UI
├── lib/
│   ├── gemini.ts        — Gemini REST wrapper
│   ├── summarizer.ts    — article summaries + daily digest
│   ├── blog-prompt.ts   — prompt builders
│   ├── supabase.ts      — admin + anon clients
│   ├── auth.ts          — NextAuth config (email only)
│   └── fetchers/        — NewsAPI / RSS / arXiv
├── supabase/schema.sql  — full DB schema (run once in SQL Editor)
├── vercel.json          — CRON + function maxDuration
├── render.yaml          — alternative Render.com blueprint
└── DEPLOY.md            — deployment walkthrough
```

---

## Environment variables

See [.env.example](.env.example) for the complete list with comments. Required for a working deploy:

```
NEXTAUTH_SECRET
NEXTAUTH_URL
EMAIL_SERVER
EMAIL_FROM
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEWSAPI_KEY
GEMINI_API_KEY
NEXT_PUBLIC_APP_URL
CRON_SECRET         (optional but recommended)
```

---

## Extending

- **Add RSS feeds**: edit `RSS_FEEDS` in `lib/fetchers/rss.ts`
- **Add categories**: update `types/index.ts` + `lib/categorizer.ts` + `supabase/schema.sql` CHECK
- **Switch AI model**: change `model:` in calls inside `app/api/write-blog/route.ts`, `app/api/blog-idea/route.ts`, `lib/summarizer.ts`
- **Add email digest**: cron a daily job that hits a new `/api/digest` endpoint and sends via your SMTP provider
