# Account-pinned deploy with an additive multi-deployment record

## Context

`wrangler deploy` lands the Worker under whatever Cloudflare account the logged-in session
points at, and a Worker `name` is unique only *per-account*. So a collaborator authed to a
different account would silently stand up a separate live copy under their own account that
no record points to — a fork. Clave's model checked "is the site deployed?" but not "deployed
to *which* account, and is the deployer pointed at it?"

## Decision

Pin the **account ID in committed `wrangler.toml` (`account_id`)** as the operative,
deterministic deploy signal, mirrored into `docs/website/deploy.md` as a human-readable
coordinate. The deploy prereq checks *"does the current login (`whoami`) have **access to**
the pinned `account_id`?"* — match → re-deploy; mismatch → **stop-and-disambiguate** (the
baton's ask-never-guess on the deploy leg), never refuse and never proceed silently.
`deploy.md` records **one or more deployments**: exactly one **canonical** (owns `site`, the
custom domain, SEO) plus zero or more explicit **mirrors** (non-canonical copies whose
baked-in canonical/OG URLs still point at the canonical deployment). Re-homing to a new
account is **additive** — add a mirror, then promote it (rewrite `site`, rebuild, redeploy,
swap canonical) — and Clave names the un-retirable residue (the old copy / domain belong to
the old account) rather than implying a clean migration.

## Considered options

- **Email-equality on `whoami`** — rejected: an owner-granted Cloudflare collaborator has a
  *different email but the same account ID* and must pass; and one login can reach several
  accounts, so raw `whoami` string-matching is ambiguous. Account-ID *access* is the only
  correct key.
- **Hard refuse on mismatch** — rejected: it makes deliberate re-homing impossible. The hole
  is *silent* forking, not deploying to a new account per se; the cure is "never change the
  account without a human saying so," not "never change it."
- **Overwrite the recorded account on re-home** — rejected: a Worker can't move between
  accounts, so overwrite just re-points the record at a new copy while the old one stays
  live — still a fork, now with the record pointing at the new orphan. An additive
  canonical+mirrors record keeps every copy legible.

## Consequences

- The account ID is committed (potentially public) — accepted as a *coordinate, not a secret*
  (you can't authenticate with it), consistent with the existing deploy-coordinates boundary.
- A mirror is an SEO duplicate of the canonical site by construction; Clave must say so
  loudly when one is added, and removing a deployment drops only the record (Clave can't tear
  down a Worker in an account it can't reach).
