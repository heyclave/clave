# Troubleshooting: Prerequisites

Off the happy path. Read this **only when a stage's prereq check fails** — most machines
already have what they need, and a stage that finds its tool present never sends you here.
Each prereq is checked lazily, by the first stage that needs it (see the per-stage
**Prereq** notes), so what's required depends on how far the run has gone: exploring
looks needs only Node; building adds pnpm and git; publishing adds Cloudflare. Don't
pre-install for a road you're not walking.

For every prereq below: **how to check it's there**, **how to check it's recent enough**,
and **what to do if it's missing or too old** — written for a non-technical owner, not a
developer. Don't improvise a different install method on someone's machine; point them at
the plain installer and stop there.

## Node.js — needed by every stage

Node provides `node`, `npx`, and `corepack`. It's the one thing that can't self-install.

- **Check:** `node --version` prints something like `v20.11.0`.
- **Version:** **18 or newer** (the capture scripts and corepack assume it). If the major
  number (the `20` in `v20.x`) is below 18, upgrade.
- **Missing or too old:** install the **LTS** build from **<https://nodejs.org>** — the
  download for their Mac or Windows. It's a plain installer they double-click; *not*
  Homebrew or nvm, which assume a developer setup. Installing LTS over an old version
  upgrades it. Re-run `node --version` to confirm before continuing.

## git — needed from build on (the saves, the remote, multi-machine work)

git versions the source and the `docs/` system of record — the ship save lands in it —
and is the transport for the owner's remote (see the git-remote step in
[build](../stages/build.md)).

- **Check:** `git --version` prints e.g. `git version 2.43.0`.
- **macOS gotcha:** macOS ships a *stub* at `/usr/bin/git`. Running `git --version` on a
  fresh Mac pops a dialog offering to install the **Command Line Tools** — accept it; that
  installs a real git. No dialog and a version prints → git is already there.
- **Windows:** not installed by default. Install from **<https://git-scm.com/download/win>**
  (the official installer; accept the defaults).
- **Version:** any reasonably current git (2.x) is fine; there's no tight floor.

## gh (GitHub CLI) — only to create/connect a GitHub remote without the website

Optional. It lets the agent run `gh repo create` and authenticate non-interactively,
making the remote setup one command instead of a browser dance. Without it, the owner
creates the empty repo in the GitHub web UI and you add it with plain `git remote add` —
slower, but no extra install.

- **Check:** `gh --version`, then `gh auth status` (prints the logged-in account).
- **Account:** GitHub itself needs a **free account** (sign up at <https://github.com> —
  free tier includes unlimited private repos). This is the one unavoidable signup on the
  publish path; it's the owner's own account, on their own truth — owned, not rented.
- **Missing:** install from **<https://cli.github.com>**, then `gh auth login` (a guided
  browser sign-in). Skip entirely if doing the remote by hand in the web UI.

## pnpm — needed to build (handled by corepack, nothing to install globally)

Scaffolded sites run on **pnpm**, pinned by `package.json`'s `packageManager` field.
You do **not** install pnpm globally — corepack (which ships with Node) activates the
pinned version.

- **Activate:** `corepack enable pnpm` (run once, in the scaffolded site — it's already in
  build.md's scaffold steps). It's a shim, not a package; nothing lands globally.
- **Check:** after activating, `pnpm --version` prints the pinned version.
- **`corepack: command not found`:** the Node install is too old or incomplete — corepack
  has shipped with Node since v16. Upgrade Node (above); corepack comes with it.
- **A signature/integrity error on `pnpm install`:** usually an old corepack. `npm i -g
  corepack@latest` updates the shim, then retry `corepack enable pnpm`.

## Cloudflare (wrangler auth) — only at deploy

`wrangler` is a dev dependency of the scaffolded site — it's already installed by
`pnpm install`; there's nothing to install separately. What deploy needs is for the owner
to be **authenticated** to their own Cloudflare account.

- **Account:** a **free Cloudflare account** (<https://dash.cloudflare.com/sign-up>). The
  owner's own account — the site deploys under it, owned not rented. Free tier covers a
  static site comfortably.
- **Authenticate:** have the owner run `wrangler login` themselves — it opens a browser
  consent screen. Suggest they type it as `! wrangler login` so its output lands in the
  session. (`pnpm exec wrangler login` from inside the site also works.)
- **Check:** `pnpm exec wrangler whoami` prints the authenticated account/email.
- **Auth expired / wrong account:** `wrangler logout` then `wrangler login` again, picking
  the right account. Custom-domain and lead-capture (Email Sending, Turnstile) setup is a
  separate guided session — see [ship.md](../stages/ship.md), not here.

Version pins, update offers, and migration live in [versioning.md](versioning.md), not
here — a pin stop looks like a failed prereq but is the skill's own doing.
