# Bitcoin Kisumu

Free, open-source Bitcoin education for Kisumu, Kenya — a community in the [My First Bitcoin Education Network](https://network.myfirstbitcoin.org/community/bitcoin-kisumu).

Live site: TODO (deploy URL — earns 15 Leaderboard pts)

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
- `app/api/` — contact, newsletter, events + RSVP endpoints backed by `data/*.json`.
- `public/` — favicon + web logo.

## Pages (Education Network complete)

Home, About, Programs, Events (+RSVP), Team, Donate (Lightning + Geyser), Resources, Executive Summary, Contact.

## Configure before launch

1. Edit `app/lib/site.js`: social links, Lightning address, Geyser URL, contact email.
2. Add team photos to `public/team/`.
3. Add a high-quality community photo for Arnold's email.
4. Deploy (Vercel recommended), paste URL into the Leaderboard profile.

## Data

Form submissions land in `data/` (git-ignored). For production scale, swap `app/lib/store.js` for a real DB — the API shapes stay the same.
