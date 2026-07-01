# Stage: Pre-ship gate

**Reads:** the built, reviewed site + `docs/website/deploy.md` (if it exists).
**Writes:** whatever a chosen add-on writes — for analytics, the beacon token into
`src/layouts/Layout.astro` and an `## Analytics` block in `docs/website/deploy.md`.

The gate sits **after first-build review, before qa + deploy**. It is the one home for
**production-only, optional add-ons** — steps that are **inert until the site is live** *and*
**optional**. That two-part rule is the membership test: analytics, a custom domain, and
lead-capture go-live provisioning all qualify; anything that shapes the build (design, copy,
form fields) or is mandatory does not. Because its members are production-only, none of this
is even *offered* until the owner has a playable build in hand — that protects
time-to-playable-build, and it's why the gate lives here and not in the brief.

**The gate can be empty.** A site with no add-ons passes straight through — no stop. It only
*appears* when it has something to offer.

**By register** (same contract as every checkpoint — see SKILL.md "Talking to the driver"):

- **Calling agent** — **silent no-op.** Never ask (no checkpoints past pre-deploy; never
  stall an unattended run) and you *can't* ask anyway (minting a provider token needs a
  dashboard human who isn't there). Act **only** on add-on intent the structured prompt
  passed explicitly (e.g. `analytics: on` + a pre-minted token); absent that, do nothing and
  move on to deploy.
- **Non-technical owner** — one plain, easy-to-wave-past offer per add-on: *"Want private
  visitor analytics? It's free and there's no cookie banner."*
- **Technical human** — same, with the dials (provider, snippet) surfaced.

## Members

### Analytics (default: Cloudflare Web Analytics)

Offer it **once, lightly, at each go-live** — the owner is already in the Cloudflare
dashboard for the deploy, so minting the token is the same session. **Gate memory is derived,
not stored:** `deploy.md` has an `## Analytics` block ⟹ already wired, **don't offer**; block
absent ⟹ offer once. A declined owner isn't nagged (one touch per deploy, not a loop) and can
opt in anytime by asking — there is **no `declined` marker**.

Cloudflare Web Analytics is **cookieless and does not fingerprint**, so it needs **no consent
banner** — that's *why* it's the default. Say that plainly; don't build a consent mechanism.
Providers that do need consent (GA4, Meta Pixel) are **siblings**, added as
`stages/analytics-<provider>.md` the way deploy targets are — never by branching this default.

**On yes — wire it, in this order, so one clean deploy carries it live:**

1. **Mint the site token.** Guide the owner (dashboard → Web Analytics → *Add a site* → enter
   the hostname → copy the **site token**). It's a **public coordinate, not a secret** — like
   the Turnstile *sitekey* — fine to commit. Manual/JS-snippet setup works on **any hostname,
   including `*.workers.dev`**; no custom domain required.
2. **Inject the beacon.** In `src/layouts/Layout.astro`, uncomment the beacon `<script>` (it
   ships commented, before `</body>`) and drop the token in. Static site, so **no `spa`
   flag**:
   ```html
   <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
           data-cf-beacon='{"token": "<site-token>"}'></script>
   ```
3. **Deploy carries it.** The normal pre-deploy save + `pnpm deploy` (`build` + `wrangler
   deploy`) rebuilds `./dist` with the beacon in it — analytics is live on this deploy, not
   the next.
4. **Record it** in `docs/website/deploy.md`'s `## Analytics` block (see deploy.md).

**Readout is the owner's Cloudflare dashboard** — the same one they deploy from. Setup is
agentic; reading the numbers is a dashboard click. **Say so** — don't imply Clave surfaces the
stats itself (an agentic readout that queries the CF Analytics API is a future
`docs/analytics/` sibling, behind a real API-token *secret*, not shipped yet).

**Escape hatch — automatic/edge injection.** An owner who wants *zero* code can instead toggle
Web Analytics on in the dashboard against their hostname (edge-injected, nothing in the repo).
Name the cost when you offer it: it's **invisible in git**, so a future session can't tell
analytics is on — it breaks *intent lives on disk*. Prefer the snippet; offer this only if
asked.

### Custom domain, lead-capture go-live provisioning

These also belong to the gate (production-only + optional), but their mechanics currently live
in [deploy.md](deploy.md) (custom domain, lead-capture provisioning). Run them from there for
now; over time they migrate under this gate so deploy narrows to "ship `./dist`, record where
it lives."

## Then

Proceed to **qa**, then the **pre-deploy checkpoint** (the always-on deploy go-ahead — the
gate feeds it, never replaces it).
