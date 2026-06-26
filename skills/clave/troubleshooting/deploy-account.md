# Troubleshooting: Deploy account mismatch

Off the happy path. Read this **only when the deploy prereq finds an account mismatch** —
`wrangler.toml` pins `account_id`, but the current login (`wrangler whoami`) can't reach
that account. On a normal re-deploy the accounts match and you never come here.

## Why this stops the deploy

`wrangler deploy` lands the Worker under **whatever account the logged-in session points
at**, and a Worker `name` is unique only *per-account*. So deploying now wouldn't update the
live site — it would **silently stand up a separate copy** under the wrong account, on its
own `*.workers.dev` subdomain, that no record points to. A custom domain wouldn't follow
(it's in the pinned account, out of this login's reach), so the copy would be an orphan.

The pin exists to catch exactly this. **Don't deploy. Stop and disambiguate** — the
account must never change without the human saying so (the baton's *ask-never-guess*, on
the deploy leg). The check is access, not identity: an owner-granted collaborator has a
**different email but the same `account_id`** and passes cleanly — only a genuinely different
account lands here.

## Name it, then offer the three real intents

Tell the driver plainly: *"This site is pinned to deploy under Cloudflare account `<id>`
(`<canonical url>`). You're logged into a different account. Deploying now would create a
separate copy under your account, not update the live site."* Then resolve which of these
they mean — never pick for them:

### 1. "I shouldn't be deploying" — hand the publish leg back (the safe default)

The site is the owner's; the deploy belongs with them. Stop here. Either the owner deploys,
or they grant *Cloudflare* access out-of-band (a separate access system from git — Clave
can't do it via `gh`; see CONTEXT.md "Deploy coordinates travel; deploy secrets do not").
If the collaborator's work needs to reach the owner first, that's a handoff-save (push); the
owner pulls and runs the deploy. **This is the default assumption when intent is unclear.**

### 2. "Publish a secondary copy under my account" — add a mirror

Allowed, but say loudly what a mirror *is*: **non-canonical by construction.** Its pages'
canonical and OG URLs still point at the canonical deployment's URL — search engines treat it
as a duplicate of the real site. It's useful as a staging/preview copy, **not** a co-equal
production site. To proceed:

- Deploy under the current account (its own `name`/`*.workers.dev`).
- Add a **Mirrors** block to `docs/website/deploy.md` (account ID + project + URL + date).
  **Do not touch** the canonical block, `astro.config.mjs` `site`, or `wrangler.toml`'s
  pinned `account_id` — the canonical deployment is unchanged.
- Commit and push (so the mirror is recorded, not a hidden fork).

### 3. "This should become the real site" — re-home (add a mirror, then promote)

Re-homing to a new account is **additive, not an overwrite** — a Worker can't move between
accounts, so this is *create-new + retire-old*, and Clave names the residue honestly:

- First deploy as a mirror (step 2): the copy goes live under the new account.
- **Promote it to canonical:** set `astro.config.mjs` `site` to the new copy's URL, set
  `wrangler.toml` `account_id` to the new account, **rebuild** (so the baked-in
  canonical/OG/sitemap URLs move — without a rebuild they still point at the old site),
  redeploy, and in `deploy.md` make this the **Canonical deployment** block (demote the old
  one, or drop it per below).
- **Name the residue, don't fake migrating it:** the old copy is still live under the old
  account at its URL, and Clave **can't take it down** (no access). If a custom domain is
  involved, it's still routed by the old account — *the old account's owner must retire their
  copy and release/re-point the domain.* Say this plainly; don't imply a clean move.

## Removing a deployment

A driver can drop a deployment they no longer want recorded — delete its block from
`deploy.md` and commit. This **only removes the record.** Clave can't tear down a live Worker
in an account it has no access to; if the deployment is live, whoever holds that account must
delete the Worker in the Cloudflare dashboard. Say so rather than implying it's gone.
