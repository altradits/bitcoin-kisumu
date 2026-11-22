# Developer notes

## Run the site locally

```sh
git clone https://github.com/<you>/bitcoin-kisumu && cd bitcoin-kisumu
git remote add upstream https://github.com/bitcoinkisumu/bitcoin-kisumu
npm ci
npm run dev        # http://localhost:3000
```

No credentials are needed. Without Upstash Redis settings, form submissions are saved in `data/*.json`, which git ignores.

## Before you push

```sh
npx next build     # must pass
```

## Code style

- Next.js 14 App Router; pages live in `app/<page>/page.js`, API routes in `app/api/<name>/route.js`.
- Plain JavaScript and the existing CSS in `app/globals.css`. Reuse the existing classes before adding new ones.
- Validate every API input on the server (type, length, allowed values).
- Keep user text short and plain. Write numbers with their source.
- Shared site data (links, events, socials) lives in `app/lib/site.js`.

## Translations

Put translated text next to the English text it replaces, and keep the same structure so reviewers can compare line by line. A native speaker should review every translation (`tACK` after reading it in context on the preview).
