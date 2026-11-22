# Contributing to Bitcoin Kisumu

Thank you for helping. This site is run by a community in Kisumu, Kenya, and anyone can contribute.

## How to contribute

1. Find an issue, or open one describing what you want to change and why.
2. Fork the repo and create a branch: `git checkout -b short-description`.
3. Make one focused change. Small pull requests get reviewed faster.
4. Run the build before you push: `npm ci && npx next build`.
5. Open a pull request. Say what you changed, why, and how you tested it.

Every pull request gets a Vercel preview link. Check your change there.

## Reviews

We review the way Bitcoin projects do. A useful review says exactly what you checked:

- **Tested ACK:** "I ran `npx next build` and opened /guide on the preview. Works."
- **Concept ACK:** you agree with the idea but haven't tested it.
- **NACK:** you think it shouldn't be merged, with a reason.

At least one review from someone other than the author is expected before merging.

## Rules

- Be kind and specific. See the [Code of Conduct](CODE_OF_CONDUCT.md).
- No secrets in the code. Settings go in `.env` (see `.env.example`), never in commits.
- Don't add new dependencies without saying why in the pull request.
- Facts on the site need a source.

## Roles

| Role | Who | Can do |
|---|---|---|
| Owners | At least two founders | Settings, members, transfers |
| Maintainers | Trusted regular contributors | Review and merge pull requests |
| Contributors | Anyone | Open issues and pull requests from a fork |

Maintainers are added after a run of good contributions and reviews.
