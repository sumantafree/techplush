# Deploying TechPulse to `techplush.mindartdigital.com`

**Stack:**
- **Supabase** → Postgres DB + user table
- **Vercel** → hosts the Next.js app (primary)
- **Hostinger cPanel** → points `techplush.mindartdigital.com` at Vercel
- **Google Gemini** → all AI features
- **Render.com** → optional fallback (see end of doc)

Follow the steps in order. Each step is independent — don't skip.

---

## 1. Create the Supabase project (5 min)

1. Go to https://supabase.com → **New project** → pick a region close to your users (Mumbai for India).
2. Wait for provisioning.
3. Open **SQL Editor → New query**, paste the full contents of [`supabase/schema.sql`](supabase/schema.sql), click **Run**.
4. Open **Settings → API** and copy these three values — you'll paste them into Vercel later:
   - `Project URL`           → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key       → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key      → `SUPABASE_SERVICE_ROLE_KEY` (**keep this secret**)

---

## 2. Get a Gemini API key (1 min)

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API key** → save as `GEMINI_API_KEY`.

Free tier is generous (>1 M tokens/day on `gemini-2.0-flash`); no billing needed to start.

---

## 3. Set up email magic-link sign-in (5 min)

Pick **one** SMTP provider — all have free tiers:

| Provider | Free tier | `EMAIL_SERVER` format |
|---|---|---|
| **Resend** (recommended) | 3 000 emails/mo, 100/day | `smtp://resend:re_XXXXXX@smtp.resend.com:465` |
| **SendGrid**             | 100 emails/day            | `smtp://apikey:SG.XXXXXX@smtp.sendgrid.net:587` |
| **Mailgun**              | 5 000 emails for 3 months | `smtp://postmaster%40mg.mindartdigital.com:PASSWORD@smtp.mailgun.org:587` |

Then set:
```
EMAIL_SERVER=<one of the above>
EMAIL_FROM=noreply@mindartdigital.com
```

**Important:** verify the domain `mindartdigital.com` in your provider's dashboard and add the DKIM + SPF TXT records they give you to your Hostinger DNS (same panel you'll use in step 6). Otherwise magic-link emails will go to spam.

---

## 4. Get a NewsAPI key (1 min)

Go to https://newsapi.org → **Get API Key**. Free tier is enough.

---

## 5. Deploy to Vercel (5 min)

### 5a. Push your code to GitHub

```bash
cd techpulse
git init
git add .
git commit -m "init: TechPulse on Gemini"
# create empty repo at https://github.com/new, then:
git remote add origin https://github.com/<you>/techpulse.git
git branch -M main
git push -u origin main
```

### 5b. Import into Vercel

1. Go to https://vercel.com/new → pick your repo.
2. **Framework preset:** Next.js (auto-detected).
3. Before you click **Deploy**, open **Environment Variables** and paste:

   ```
   NEXTAUTH_SECRET              = <run: openssl rand -base64 32>
   NEXTAUTH_URL                 = https://techplush.mindartdigital.com
   EMAIL_SERVER                 = smtp://... (from step 3)
   EMAIL_FROM                   = noreply@mindartdigital.com

   NEXT_PUBLIC_SUPABASE_URL     = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY= eyJ...
   SUPABASE_SERVICE_ROLE_KEY    = eyJ...

   NEWSAPI_KEY                  = <newsapi.org key>
   GEMINI_API_KEY               = <aistudio.google.com key>

   NEXT_PUBLIC_APP_URL          = https://techplush.mindartdigital.com
   CRON_SECRET                  = <any long random string>
   ```

4. Click **Deploy**. First build takes ~2 min.
5. Vercel will give you a temporary URL like `techpulse-xxxx.vercel.app`. Open it — the app should load (no articles yet).

### 5c. Trigger the first article fetch

Visit `https://<temp-vercel-url>/api/refresh?` — this pulls the first batch.
The daily CRON is already wired via [`vercel.json`](vercel.json) and fires at 06:00 UTC.

---

## 6. Point `techplush.mindartdigital.com` at Vercel (10 min, Hostinger)

### 6a. Add the subdomain in Vercel

1. Vercel project → **Settings → Domains → Add**.
2. Enter `techplush.mindartdigital.com` → click **Add**.
3. Vercel will show **one of two** DNS instructions. Note which:

   **Option A — CNAME (easier, recommended):**
   ```
   Type:  CNAME
   Name:  tutor
   Value: cname.vercel-dns.com
   ```

   **Option B — A record (if Hostinger blocks CNAMEs on root-adjacent subs):**
   ```
   Type:  A
   Name:  tutor
   Value: 76.76.21.21
   ```

   Vercel screens vary; **use whatever it shows you**.

### 6b. Add the DNS record in Hostinger

1. Log in to Hostinger → **Domains → mindartdigital.com → DNS / Nameservers**.
   *(On some cPanel layouts: cPanel → **Zone Editor** → mindartdigital.com → **+ CNAME Record**.)*
2. Click **Add record**. Fill it in exactly as Vercel told you:

   | Field | Value (Option A / CNAME) |
   |---|---|
   | Type  | CNAME |
   | Name  | `tutor` (NOT `techplush.mindartdigital.com`) |
   | Points to / Target | `cname.vercel-dns.com` |
   | TTL   | 3600 (or default) |

3. **Save**.
4. Wait 5–15 min for DNS to propagate. Check with:
   ```bash
   nslookup techplush.mindartdigital.com
   ```
   You should see `cname.vercel-dns.com` in the answer.
5. Back in Vercel, the domain row changes from "Invalid Configuration" → "Valid Configuration ✓" and Vercel auto-issues an SSL cert (~1 min).

### 6c. Flip NEXTAUTH_URL + app URL

Once the domain is green in Vercel:
1. Vercel → **Settings → Environment Variables** → confirm both are `https://techplush.mindartdigital.com` (not the temp URL).
2. **Deployments → Redeploy latest** so the new env is live.

---

## 7. Test the live site

1. Open https://techplush.mindartdigital.com
2. Click **Sign in** → enter your email → check inbox → click the magic link.
3. Visit `/library` and save an article.
4. Click **Generate Blog Idea** on a saved article. You should get a Gemini-generated idea in ~3 s.

If anything fails, check **Vercel → Logs** on the failing request.

---

## Render.com (alternative host)

If you ever need to move off Vercel (cost, region, etc.):

1. Commit [`render.yaml`](render.yaml) (already included).
2. Go to https://dashboard.render.com/blueprints → **New Blueprint** → pick repo.
3. Set the same env vars in Render's dashboard.
4. In Hostinger DNS, change the CNAME for `tutor` from `cname.vercel-dns.com` to the hostname Render gives you (something like `techpulse.onrender.com`).

Note: Render's free Web Service sleeps after 15 min of inactivity — you'll have cold starts. Vercel's free tier doesn't sleep, which is why it's the primary recommendation.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Magic-link email goes to spam | Add DKIM + SPF TXT records from your SMTP provider to Hostinger DNS |
| `GEMINI_API_KEY not configured` on `/write` | Env var missing in Vercel → add it and redeploy |
| Domain stuck on "Invalid Configuration" after 30 min | Record type is wrong. Re-check step 6b. `nslookup` must return exactly what Vercel asked for |
| `/api/refresh` returns 401 in prod | `CRON_SECRET` in Vercel env doesn't match what the CRON sends — re-set it |
| No articles after first `/api/refresh` | `NEWSAPI_KEY` invalid or RSS feeds blocked — check Vercel logs |
