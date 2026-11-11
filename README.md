# Bitcoin Kisumu

Free, open-source Bitcoin education for Kisumu, Kenya — a community in the [My First Bitcoin Education Network](https://network.myfirstbitcoin.org/community/bitcoin-kisumu).

Live site: https://bitcoin-kisumu.vercel.app/

## Quick start

```bash
cd /Users/mac/bitcoin-kisumu
npm install
npm run dev
```

Open http://localhost:3000 in a browser.

Production:

```bash
npm run build
npm start
```

## What's inside

- `assets/` — logo kit (SVG) + brand guide. `logo.svg` is the Leaderboard upload.
- `content/` — Leaderboard drafts: bio, 250-word intro, executive summary, team, socials, donate, checklist.
- `app/` — Next.js 14 fullstack site (App Router, no external CSS framework).
- `app/api/` — contact, newsletter, events + RSVP endpoints backed by Upstash Redis on Vercel, `data/*.json` locally.
- `public/` — favicon + web logo.

## Pages (Education Network complete)

Home, About, Programs, Events (+RSVP), Team, Donate (Lightning + Geyser), Resources, Executive Summary, Contact.

## Configure before launch

1. Edit `app/lib/site.js`: social links, Lightning address, Geyser URL, contact email.
2. Add team photos to `public/team/`.
3. Add a high-quality community photo for Arnold's email.
4. Deploy (Vercel recommended), paste URL into the Leaderboard profile.

## Data

Form submissions (contact, newsletter, RSVPs) go through `app/lib/store.js`:

- **On Vercel with Redis connected:** durable Upstash Redis storage.
- **Local dev without Redis env vars:** `data/*.json` files (git-ignored).

API shapes are identical either way.

### Connect Redis (one-time, ~2 min)

1. Vercel dashboard → project `bitcoin-kisumu` → **Storage** tab → **Create** → Upstash Redis → connect to this project.
2. Redeploy (any push redeploys, or Redeploy in the dashboard). The integration adds `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` automatically.
3. Local Redis (optional): copy those two values into `.env.local` (see `.env.example`). Without them, local dev just uses `data/`.
