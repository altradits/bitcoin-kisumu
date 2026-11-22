# Bitcoin Kisumu

Free, open-source Bitcoin education for Kisumu, Kenya — a community in the [My First Bitcoin Education Network](https://network.myfirstbitcoin.org/community/bitcoin-kisumu).

Live site: https://bitcoin-kisumu.vercel.app/

## Quick start

```bash
git clone https://github.com/bitcoinkisumu/bitcoin-kisumu.git
cd bitcoin-kisumu
npm install
npm run dev
```

Open http://localhost:3000 in a browser.

Production:

```bash
npm run build
npm start
```

## Repository structure

- `app/` — Next.js 14 site (App Router, no external CSS framework). Pages, `app/api/` endpoints and `app/lib/` helpers.
- `app/api/` — contact, newsletter, events + RSVP endpoints backed by Upstash Redis on Vercel, `data/*.json` locally.
- `content/` — Leaderboard drafts: bio, 250-word intro, executive summary, team, socials, donate, checklist.
- `data/` — local dev storage for form submissions (git-ignored; Redis is used on Vercel).
- `public/` — favicon + web logo, team photos (`public/team/`).
- `assets/` — logo kit (SVG) + brand guide. `logo.svg` is the Leaderboard upload.
- `db/migrations/` — numbered plain-SQL migrations (`npm run db:migrate`).
- `scripts/` — asset generators, migration runner, automated tests.
- `doc/` — developer notes and other contributor documentation.

## Pages

Home (`/`), About (`/about`), Programs (`/programs`), Guide (`/guide`), Merchants (`/merchants`), Events + RSVP (`/events`), Team (`/team`), Donate (`/donate`, Lightning + Geyser), Treasury (`/treasury`), Resources (`/resources`), Executive Summary (`/executive-summary`), Contact (`/contact`).

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

### Postgres (pilot records — earners, results, audit)

Pilot records live in Postgres (Neon free tier on Vercel). Public pages and the contact/newsletter/RSVP forms never touch it, so everything works with `DATABASE_URL` unset.

1. Vercel dashboard → project `bitcoin-kisumu` → **Storage** tab → **Create** → Neon Postgres → connect (adds `DATABASE_URL`).
2. Local Docker: `docker run --name bk-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bitcoinkisumu -p 5432:5432 -d postgres:16`, then set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bitcoinkisumu` in `.env.local`.
3. Run migrations: `npm run db:migrate` (idempotent; `-- --dry-run` lists pending files).

Rate limiting also uses Redis automatically when the Upstash vars exist (atomic counters shared across instances); otherwise it falls back to in-memory limits.

## Contributing

Everyone is welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow (Bitcoin Core-style), the [Code of Conduct](CODE_OF_CONDUCT.md), and the [Security Policy](SECURITY.md) before opening an issue or pull request.

## Launch roadmap

The remaining launch tasks are tracked as [GitHub issues](https://github.com/bitcoinkisumu/bitcoin-kisumu/issues) — pick one up, comment to claim it, and open a pull request against `main`.

## License

[MIT](LICENSE) — free and open-source, like the education we teach.
