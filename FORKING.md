# Forking Bitcoin Kisumu for Your Circular Economy

This repo is MIT-licensed and built to be forked. Any Bitcoin circular
economy can run its own education + pilot-ops site in about 10 minutes,
with zero vendor lock-in (Vercel/Neon/Upstash are conveniences, not
requirements — everything also runs on files + Docker Postgres).

## 1. Fork and clone (1 min)

```sh
git clone https://github.com/<you>/bitcoin-kisumu && cd bitcoin-kisumu
git remote add upstream https://github.com/bitcoinkisumu/bitcoin-kisumu
npm ci
npm run dev        # http://localhost:3000, works with zero credentials
```

## 2. Make it yours (4 min)

1. `app/lib/site.js` — name, tagline, locale, email, Lightning address,
   Geyser URL, socials, team, events.
2. `app/lib/transparency.js` — buckets, KPIs, budget targets, forecast,
   proof-of-reserve slot.
3. `content/leaderboard-bio.md`, `content/executive-summary.md` — your story.
4. `public/` — swap `logo.svg`, `favicon.svg`, team photos (`public/team/`).
5. `app/lib/merchants.js` — your shop categories (or leave empty for the
   honest onboarding state).

## 3. Add storage when ready (5 min)

- **Forms now, Postgres later:** without env vars, forms use `data/*.json`
  and all public pages work. Nothing breaks.
- **Redis (Upstash or Marketplace):** set `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_*`) for durable forms +
  shared rate limits.
- **Postgres (Neon, Docker, or any Postgres 13+):** set `DATABASE_URL`,
  then `npm run db:migrate` (idempotent plain-SQL migrations in
  `db/migrations/`). This unlocks `/admin`: inbox, earners, results,
  merchants, payouts, inflows, CSV exports.
- **Admin sign-in:** create a GitHub OAuth App, set `GITHUB_CLIENT_ID`,
  `GITHUB_CLIENT_SECRET`, `AUTH_SECRET` (`openssl rand -hex 32`) and
  `ADMIN_GITHUB_LOGINS` (comma-separated usernames). See `.env.example`.

## 4. Verify and deploy

```sh
npm run lint && npm run build
npm run test:rsvp && npm run test:ratelimit && npm run test:admin && npm run test:forms
# With DATABASE_URL set, the DB suites also run:
npm run test:db && npm run test:earners && npm run test:results && npm run test:export
npm run test:pilot && npm run test:merchants-payouts && npm run test:inflows && npm run test:verify
```

Deploy anywhere Node runs: `npm run build && npm start`. The same
checks run in CI on every push and pull request.

## 5. Stay in sync (optional)

```sh
git fetch upstream && git merge upstream/main
```

Upstream improvements (curriculum bridges, audit tooling, UX research)
merge cleanly as long as your local changes stay in the files from step 2.
