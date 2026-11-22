# Developer notes

## Run the site locally

```sh
git clone https://github.com/<you>/bitcoin-kisumu && cd bitcoin-kisumu
git remote add upstream https://github.com/bitcoinkisumu/bitcoin-kisumu
npm ci
npm run dev        # http://localhost:3000
```

No credentials are needed. Without Upstash Redis settings, form submissions are saved in `data/*.json`, which git ignores.

## Postgres (optional, for pilot records)

```sh
docker run --name bk-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bitcoinkisumu -p 5432:5432 -d postgres:16
echo 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bitcoinkisumu' >> .env.local
npm run db:migrate        # idempotent; add -- --dry-run to preview
npm run test:db           # skips green without DATABASE_URL
```

Migrations are plain SQL in `db/migrations/`, applied in filename order and tracked in `schema_migrations`. Public pages and existing forms never require the database.

## Admin sign-in (local)

```sh
# 1. Create a GitHub OAuth App (see .env.example) with callback:
#    http://localhost:3000/api/admin/callback
# 2. Fill GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_SECRET
#    (openssl rand -hex 32) and ADMIN_GITHUB_LOGINS in .env.local
npm run dev           # sign in at http://localhost:3000/admin
npm run test:admin    # fail-closed gates, allowlist, expiry, logout
```

Sessions are HMAC-signed, HTTP-only, 12h expiring. Missing env vars fail closed (401/403), never open. No Auth.js dependency by design — the whole flow is `app/lib/adminAuth.js` + `app/api/admin/*`.

## Before you push

```sh
npm run lint          # must pass
npm run build         # must pass
npm run test:rsvp     # must pass
npm run test:ratelimit
npm run test:db       # needs local Postgres or skips
npm run test:admin
```

## Code style

- Next.js 14 App Router; pages live in `app/<page>/page.js`, API routes in `app/api/<name>/route.js`.
- Plain JavaScript and the existing CSS in `app/globals.css`. Reuse the existing classes before adding new ones.
- Validate every API input on the server (type, length, allowed values).
- Keep user text short and plain. Write numbers with their source.
- Shared site data (links, events, socials) lives in `app/lib/site.js`.

## Translations

Put translated text next to the English text it replaces, and keep the same structure so reviewers can compare line by line. A native speaker should review every translation (`tACK` after reading it in context on the preview).
