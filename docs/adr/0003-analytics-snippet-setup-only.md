# Cloudflare Web Analytics by snippet, setup-only, readout deferred

> **Superseded by [0005-one-owner-one-road.md](0005-one-owner-one-road.md)** (2026-07-03):
> analytics is removed from the skill entirely — the owner's Cloudflare dashboard answers
> "is anyone visiting?" with zero repo changes. The snippet/readout analysis below remains
> the reference if a beacon-level analytics ask ever returns.

## Context

Owners ask "is anyone visiting?" Clave's anchor is a non-technical owner who never types
git and shouldn't have to live in a dashboard. Adding analytics raises the same question
lead capture did: how much of it can stay agentic, and where is the honest manual seam?

Three forces shape the answer. (1) The site already deploys to the owner's **own
Cloudflare account** — so a Cloudflare-native analytics is the same-account, no-second-vendor
match that `cloudflare-email` was for lead capture; every other provider (Plausible,
Fathom, GA4, PostHog) is a second account to onboard and a sibling at best. (2) The skill's
governing principle is **intent lives on disk** — a resuming agent must learn what's true
from committed artifacts, never from a dashboard it can't see. (3) Cloudflare Web Analytics
can be enabled two ways: *automatic* (edge-injected, toggled in the dashboard against a
hostname — writes nothing to the repo) or *manual* (a `<script>` with a public site-token,
injected by the agent into the single `<head>` in `Layout.astro`).

## Decision

**Default analytics is Cloudflare Web Analytics, wired by the manual snippet, and the first
ship is setup-only.** Three parts:

- **Snippet, not edge-injection.** The agent owns the wiring: the beacon `<script>` plus a
  **public site-token** goes into `Layout.astro` (the one head injection point) and is
  committed like any code — exactly the [[analytics-readout-boundary]] coordinate, the
  analog of lead capture's Turnstile *sitekey*. Edge/automatic injection is rejected as the
  default: it writes nothing to git, so a fresh session cannot know analytics is on — it
  fails *intent lives on disk*. (Automatic stays a documented escape hatch for an owner who
  insists on zero code, with the legibility cost named.)
- **Setup-only.** The agent owns 100% of the *code* (snippet + config + the one guided
  dashboard step that mints the token). The **readout stays the Cloudflare dashboard the
  owner already uses for deploy.** We do not claim "100% agentic" — we claim, like lead
  capture, that *setup* is agentic and name the one manual act plainly.
- **Readout deferred, not denied.** An agentic readout (a future session where the owner
  asks "how's traffic?" and the agent queries the CF GraphQL Analytics API and narrates
  plain-language numbers) is the genuinely dashboard-free version and the obvious next
  sibling. It is **out of the first ship** but the config shape reserves its seam: analytics
  lives as a future `docs/analytics/` workflow + `stages/analytics-<provider>.md` sibling,
  and the readout's API token (a real **secret**, unlike the snippet) has a named home
  before it exists. See [[analytics-readout-boundary]].

- **Home: the pre-ship gate, offered at go-live — not the brief.** Analytics is **inert
  until the site is live**, so it is offered at the **[[pre-ship-gate]]** (after the playable
  build, before deploy), *not* decided at brief time the way lead capture is. This protects
  time-to-playable-build (nothing production-only is asked before the owner has a site to
  play with) and puts the offer in the same go-live dashboard session where the owner mints
  the token. Sequencing: on **yes**, mint the token → inject into `Layout.astro` → the normal
  `pnpm build && wrangler deploy` picks it up in **one clean deploy** (snippet live
  immediately); on **no/skip**, deploy proceeds untouched and analytics is re-offered on any
  later redeploy. No brief `## Analytics` section; the record lands in `deploy.md`.

- **Consent posture is a selection criterion, not an afterthought.** The default is chosen
  **partly because** Cloudflare Web Analytics is **cookieless and does not fingerprint**, so
  it needs **no consent banner** — no extra UI, no consent state machine, nothing for a
  non-technical owner to manage. Clave does **not** build a consent mechanism for the
  default; it states the cookieless-no-banner property plainly. Providers that *do* require
  consent (GA4, Meta Pixel) are siblings **for exactly this reason** — pushing the
  consent-banner burden out of the default path is itself part of why they're siblings, not
  co-defaults.

## Considered options

- **Automatic / edge-injected as default** — rejected: invisible in git, so it violates
  *intent lives on disk*; a resumer can't verify it's on without dashboard access. Kept only
  as an escape hatch.
- **A third-party provider (Plausible / Fathom / GA4 / PostHog) as default** — rejected for
  the default slot: each is a *second* account to onboard and bill, and GA4/PostHog drag in
  consent banners and a marketing-grade posture the "is anyone visiting?" owner didn't ask
  for. They are legitimate **siblings** (`stages/analytics-<provider>.md`), added the way
  deploy targets are, never by branching the default.
- **Ship the agentic readout now** — rejected for the first ship: it needs a stored API
  **secret**, a `docs/analytics/` read workflow, and scoping care. Deferring it keeps the
  first ship small without painting us into a corner (the seam is reserved above).
- **Server-side / zero-client (log-based, no beacon)** — rejected as default: no `<head>`
  snippet and the best privacy story, but a coarser readout and plan-dependent availability.
  Kept as a privacy-max sibling.

## Consequences

- The site-token is committed (public) — accepted as a **coordinate, not a secret**,
  consistent with the existing deploy-coordinates and Turnstile-sitekey boundaries.
- Analytics is **opt-in per site**, offered at the **[[pre-ship-gate]]** (not the brief),
  and recorded in `deploy.md` when taken. A static site stays a static site — no beacon, no
  consent surface — unless the owner opts in at go-live.
- We owe the owner an **honest expectation** up front (as lead capture does): setup is
  agentic, but reading the numbers is a click in their Cloudflare dashboard until the
  readout sibling ships.
- **Gate memory is derived from `deploy.md`, not a status field.** The `## Analytics` block
  present ⟹ already wired, don't offer. Absent ⟹ offer **once, lightly** at each go-live. A
  declined owner isn't nagged (one light touch per deploy, not a loop) and can opt in
  anytime by asking — no `declined` marker, consistent with *state is derived*.
- Pre-existing ADR numbering collision (two `0001`s, neither yet git-tracked) is noted for
  cleanup; this ADR takes `0003` to avoid compounding it.
