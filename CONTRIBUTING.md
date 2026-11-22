# Contributing to Bitcoin Kisumu

Bitcoin Kisumu is open to everyone. We follow the same contribution workflow as Bitcoin Core and other Bitcoin open-source projects, so what you learn here works in those projects too.

Anyone can contribute, and nobody needs permission to review. Maintainers merge only after review.

## Communication

- **Issues** are for bugs, ideas and tasks. Search first, then open one with the right template.
- **Pull requests** are for changes. Link the issue the change solves.
- To take an issue, comment on it. If you stop working on it, say so, so someone else can pick it up.
- Security problems are never reported in public. See [SECURITY.md](SECURITY.md).

## Contributor workflow

1. Fork the repository.
2. Create a topic branch from an up-to-date `main`:
   ```sh
   git switch main && git pull upstream main
   git switch -c translate-guide-swahili
   ```
3. Make your change in one or more commits (see [Commits](#commits)).
4. Check it locally (see [doc/developer-notes.md](doc/developer-notes.md)): `npm ci && npx next build`.
5. Push to your fork and open a pull request against `main`.

Every pull request gets a Vercel preview link. Check your change there and mention it in the description.

### Commits

Commits should be **atomic**: each one does one thing and leaves the site building, so a reviewer can check it on its own.

Commit messages follow this form:

```
area: short summary in the present tense, 50 characters or fewer

Optional body after a blank line, wrapped at 72 characters. Explain
what changed and why, not how. Link issues with "Fixes #12".
```

Areas used in this repository:

| Area | For |
|---|---|
| `guide` | The Guide page |
| `i18n` | Swahili and Dholuo translations |
| `ui` | Pages, components and styles |
| `design` | Images, icons and brand assets |
| `content` | Text on Resources, Programs, About and other pages |
| `api` | Routes in `app/api/` |
| `db` | Database schema and migrations |
| `admin` | Admin pages |
| `security` | Security fixes and hardening |
| `ci` | GitHub Actions and checks |
| `doc` | Documentation in the repository |

Examples: `i18n: translate the Guide page into Swahili`, `api: rate limit the contact form`.

### Pull request title and description

- Prefix the title with the main area, like a commit: `api: rate limit the contact form`.
- Fill in the template: what changed, why, and how you tested it.
- Keep a pull request to one topic. Split large work into several pull requests.
- Mark a pull request as a draft until it is ready for review.

### Updating a pull request

When a reviewer asks for changes:

- Fix the commit where the problem is, instead of adding "fix review" commits on top:
  ```sh
  git commit --fixup=<commit>
  git rebase -i --autosquash main
  git push --force-with-lease
  ```
- If `main` has moved on and your branch conflicts, **rebase** on `main`. Do not merge `main` into your branch.
- Reply to each review comment, or resolve it with a short note on what you changed.

## Peer review

Anyone can review, and reviewing is one of the most valuable ways to contribute. Start your review comment with one of these:

| Term | Meaning |
|---|---|
| **Concept ACK** | I agree with the goal of this change. |
| **Approach ACK** | I agree with the goal and with how it is done. |
| **tACK `<commit>`** | Tested ACK: I ran it and it works. Say what you tested. |
| **utACK `<commit>`** | Untested ACK: I read the code and it looks right, but I did not run it. |
| **ACK `<commit>`** | I reviewed the code and tested it as far as I could. |
| **NACK** | I disagree with this change. Always give a reason. |
| **nit** | A small, non-blocking suggestion. |

Put the commit hash you reviewed after the ACK (the first 7 characters are enough), so it is clear which version you approved. For example:

> tACK a1b2c3d
> Ran `npx next build` and opened /guide on the preview. The Swahili text shows correctly on a phone.

## Decision making

- Maintainers merge a pull request when it has at least one ACK from someone other than the author, all checks pass, and no NACK is left unanswered.
- Changes to how we pay people, handle money or store personal data need ACKs from two maintainers.
- Pull requests are merged with a merge commit titled `Merge #<number>: <title>`, so each commit keeps its own history.
- A pull request waiting for its author for more than 30 days may be closed and labelled **Up for grabs** so someone else can finish it.

## Labels

| Label | Meaning |
|---|---|
| `good first issue` | Small and well described; a good place to start. |
| `help wanted` | Open to anyone. |
| `Up for grabs` | Was started but abandoned; anyone can take it over. |
| `Waiting for author` | The author needs to respond to review. |
| `Needs rebase` | The branch conflicts with `main`. |
| `Brainstorming` | An idea to discuss before anyone writes code. |
| `backend`, `translation`, `design`, `content`, `accessibility`, `security` | The area of the change. |

## Roles

| Role | Who | Can do |
|---|---|---|
| Owners | At least two founders | Settings, members, transfers |
| Maintainers | Trusted regular contributors | Review and merge pull requests |
| Contributors | Anyone | Open issues, review, and open pull requests from a fork |

Maintainers are added after a run of good contributions **and** reviews.

## Rules

- Be kind and specific. See the [Code of Conduct](CODE_OF_CONDUCT.md).
- No secrets in the code. Settings go in `.env.local` (see `.env.example`), never in commits.
- Don't add a dependency without saying why in the pull request.
- Facts on the site need a source.
- Contributions are released under the [MIT licence](LICENSE).
