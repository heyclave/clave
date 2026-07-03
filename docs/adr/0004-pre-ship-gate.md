# A pre-ship gate for production-only, optional add-ons

> **Superseded by [0005-one-owner-one-road.md](0005-one-owner-one-road.md)** (2026-07-03):
> with analytics removed, the gate has no member that lives in it (custom domain and
> lead-capture go-live sit in the ship stage), so the node is deleted rather than kept
> empty. The membership rule below (inert-until-live AND optional) remains the test to
> re-derive if such an add-on ever returns.

## Context

Adding analytics surfaced a gap the pipeline didn't have a name for. Analytics is **inert
until the site is live** — a tracking beacon on a `localhost` build measures nothing — and
it is **optional**. Lead capture's model (decide at brief, thread through build) is the
wrong fit: lead capture changes *what's on the page* (fields, form, thanks copy), so it must
be a build-time content decision; analytics changes *nothing the visitor sees* and matters
only in production.

More than that, analytics is not alone. **Custom domain** and **lead-capture go-live
provisioning** (token/secret, verified sending domain) share the same two properties:
nothing until deploy, and optional. Today each is bolted onto the deploy stage ad-hoc, with
no shared pattern — the next such add-on would be bolted on the same way.

The driving constraint is **time-to-playable-build**: the owner's first want is a site to
look at and iterate (the first-build review). Anything production-only is dead weight before
that moment and must not sit on the path to it, nor be *asked about* before the owner even
has a build in hand.

## Decision

Introduce a **pre-ship gate** — a named pipeline node between **first-build review** and
**QA + deploy** — as the single home for production-only, optional add-ons.

- **Membership rule (crisp, testable):** a step belongs in the pre-ship gate **iff** it is
  (1) **inert until live** — no effect on the local/playable build — **and** (2)
  **optional** — a site can ship without it. This admits analytics, custom domain, and
  lead-capture go-live provisioning; it excludes anything that shapes the build (design,
  copy, form fields) and anything mandatory.
- **Placement honors time-to-playable-build:** the gate sits **after** the playable build
  and first-build review, so none of its offers precede the moment the owner gets a site to
  play with. Pipeline:
  `… → build → [first-build review] → ⟨pre-ship gate⟩ → qa → deploy`.
- **Each member is independently skippable**; the gate imposes nothing. It is the
  **"side-quest" home** — only-if-you-want-it, off the happy path to a playable build, but
  a *named* home so future add-ons get an address instead of another ad-hoc deploy-stage
  bolt-on.
- **Relationship to the existing pre-deploy checkpoint:** the pre-ship gate is a distinct,
  earlier concept (offer the production-only add-ons), and the pre-deploy checkpoint remains
  the final, always-on deploy go-ahead. The gate *feeds* deploy; it does not replace the
  approval.
- **Analytics is the gate's first member.** See [[analytics-snippet-setup-only]].

## Considered options

- **Widen the existing pre-deploy checkpoint instead** — rejected: it conflates "offer
  optional production-only add-ons" with "approve the irreversible deploy," and gives future
  add-ons no legible address. A named gate is the more coherent home.
- **Offer analytics inside deploy.md only** — rejected: smallest change, but no pattern, so
  the next production-only add-on gets bolted on ad-hoc again (the exact state we're in).
- **Mirror lead capture (decide at brief)** — rejected: analytics is a *deployment* concern,
  not a *content* one; asking a non-technical owner about it before they have a build is
  premature, and a token placeholder is inert until deploy anyway.
- **Membership = "requires the Cloudflare dashboard"** — rejected: a mechanism test, not a
  purpose test; it wrongly pulls in deploy itself and would exclude a production-only add-on
  that doesn't touch Cloudflare.

## Consequences

- **SKILL.md's contract tables and checkpoint list gain the pre-ship gate** — this ADR is
  only coherent once the pipeline diagram, the checkpoints section, and the target dials
  reflect the new node. Drift between them is the main failure mode (see AGENTS.md).
- **Custom domain and lead-capture go-live provisioning should migrate into the gate** over
  time, so the deploy stage narrows to "ship `./dist`, record where it lives." Not required
  by the first analytics ship, but the gate is where they belong.
- The gate is **register-aware like every checkpoint**, and this is a hard rule, not a
  nicety. For the **calling-agent** register the gate is a **silent no-op** — it never asks
  (the register contract is *no checkpoints past pre-deploy; never stall an unattended run*)
  and it *cannot* ask (minting a provider token needs a dashboard human who isn't there). It
  acts **only** on add-on intent carried explicitly in the structured prompt (e.g.
  `analytics: on` + a pre-minted token); absent that, it does nothing and keeps moving. A
  **non-technical owner** sees plain offers ("want private visitor analytics? it's free"); a
  **technical human** sees the dials.
- The gate **can be empty** — a site with no add-ons passes straight through, no stop. It is
  a gate that only *appears* when it has something to offer.
