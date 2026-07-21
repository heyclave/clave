# Stage: Ship

**Reads:** the built site + `brief.md` + `design.md` + `voice.md`.
**Writes:** `docs/website/deploy.md` (project, URL, QA date; lead-capture config when
present).

**Prereq:** the owner **authenticated to their own Cloudflare account** (`wrangler` is
already a site dependency — nothing to install). Checked here, not earlier, on purpose:
the owner should already have a site they love before the one technical ask of the whole
road. Frame it plainly — a free account at <https://dash.cloudflare.com/sign-up>, the site
lives under *their* account, owned not rented — then have them run `! wrangler login`
(browser consent) and check `pnpm exec wrangler whoami`. Trouble →
[troubleshooting/prerequisites.md](../troubleshooting/prerequisites.md).

**Runs once, when the owner wants to go live** — not between look-and-feel iterations
(build's smoke check covers those). Tooling failures never block: if a check's tool is
missing, note it and review the markup directly.

## Audit

Capture every page from the brief, then check from the artifacts:

```bash
pnpm shots / /about ...    # mobile + desktop full-page screenshots
pnpm audit / /about ...    # axe-core accessibility scan
```

(also collect rendered HTML and console errors)

**Is it broken?** (objective):

- [ ] Layout holds at 375 and 1280 — no overflow, overlap, or cutoff
- [ ] No console errors; no broken images or links
- [ ] Accessibility passes — contrast, alt text, labels, focus, heading order
- [ ] Tap targets ≥ 44px; body text ≥ 16px
- [ ] SEO plumbing renders — unique title + description per page, canonical/OG tags,
      `sitemap-index.xml`, `robots.txt`, 404
      → all need `site` set in `astro.config.mjs` — fix that first if missing

**Is it right?** (vs the specs):

- [ ] Copy uses nothing from `voice.md`'s "not that" column
- [ ] Exact CTA copy from `brief.md` is present, above the fold; proof appears where claimed
- [ ] Colors, fonts, and spacing match `design.md`'s named values (not just "close")
- [ ] **Judgment:** does each page actually do `brief.md`'s job and read in `voice.md`'s
      voice — not just pass the boxes above? Look at the page as the target customer and
      decide — the one check a checklist can't make for you.

**Lead capture** (only if `brief.md` has a `## Lead capture` section) — the static half;
the live send-and-confirm can't run from local dev and closes at go-live (below):

- [ ] **Form is accessible** — every field labelled, focus order sane, error announced
      (`role="alert"`), tap targets ≥ 44px
- [ ] **Wiring is right** — `method="POST" action="/api/lead"`, honeypot + Turnstile widget
      present, fields match the brief, `wrangler.toml` lead-capture block uncommented with
      `LEAD_TO`/`LEAD_FROM` set
- [ ] Exercise the flow with `pnpm dev:full` — honeypot drops silently → `/thanks`; missing
      Turnstile → rejected

Report findings (severity, page, issue, fix) and route each via the three lanes (SKILL.md):
code drifted → fix it; spec is wrong → edit the spec, rebuild. Loop until a run yields
**zero findings against the current build**. The same issue looping ~2–3 times without
converging → surface it to the owner instead of looping further.

## Publish

- [ ] **Account pin** (re-deploys): if `wrangler.toml` already has `account_id`, confirm
      the current login can reach it — the check is *"does `wrangler whoami` list the
      pinned account?"*, not string-matching the email. Mismatch → **stop, don't deploy**:
      [troubleshooting/deploy-account.md](../troubleshooting/deploy-account.md). First
      deploy → set `name` in `wrangler.toml` (it becomes the `<name>.workers.dev`
      subdomain) and fill `account_id` from `whoami` (one account → use it; several → ask
      the owner which, in plain terms). Both are coordinates, not secrets — committed.
- [ ] `site` in `astro.config.mjs` set to the production URL (the custom domain, not the
      `*.workers.dev` URL, if one's going on) — SEO/sitemap/OG derive from it
- [ ] `pnpm build` succeeds locally
- [ ] **The go-ahead — the one stop that never skips.** Say what will ship (project,
      URL, what changed) and wait for an explicit yes. Never automatic after a passing
      audit. If anything changed since the audit (including while waiting), re-run it
      scoped to the change — the audit leaves no artifact, so a fresh check can't be stale.
- [ ] **Save** — commit the current state, push if there's a remote:
      ```bash
      git add -A && git commit -m "<plain summary of what's shipping>"
      git push    # only if there's a remote
      ```
      → every publish, including redeploys — so saved/pushed state always equals what's
        live. Narrate it as *"saved this version before publishing"*, never in jargon.
        Trouble → [troubleshooting/git.md](../troubleshooting/git.md)
- [ ] Ship it — the template's `wrangler.toml` is configured for static assets;
      `wrangler deploy` uploads `./dist` to the edge (sites with lead capture also carry
      the tiny worker entry; same command):
      ```bash
      pnpm deploy            # = astro build && wrangler deploy
      ```
- [ ] Confirm the live URL loads and renders on mobile, then announce it:
      *"✦ Milestone 4 of 4 — you're live: <url>"* — and offer the custom domain (below)
      in the same breath.

## Custom domain (strongly recommended)

A site can ship on `*.workers.dev` and add a domain later — but nudge toward one: it's
credibility, SEO, and (if lead capture is in play) the **email-sending prerequisite**
(the `From` address must be on a domain in the owner's Cloudflare account).

1. **No domain yet** → buy via **Cloudflare Registrar** (at-cost, lands directly in the
   account, no nameserver dance). Guided dashboard step: "Open the Registrar, search a
   name, buy it — it'll appear in your account in a minute."
2. **Registered elsewhere** → add the zone to the Cloudflare account, then the owner
   updates nameservers at their current registrar (a human step you can't do for them;
   propagation can take up to ~24h). Wait for the zone to go active.

Then attach the domain to the Worker (dashboard: Workers → the project → Domains &
Routes → Add — prefer the dashboard if the CLI route errors), update `site` in
`astro.config.mjs` to the domain, and **rebuild + redeploy** (canonical/OG/sitemap URLs
are baked in at build time). Record the new canonical URL in `docs/website/deploy.md`.

## Lead-capture go-live (one-time, only if the brief asks for capture)

Run this **once per site**, at the first publish of a site with capture. **Set
expectations first:** ~10 minutes of guided dashboard clicking *together* — verifying the
owner's inbox and creating a Turnstile widget — plus the custom domain above (the `From`
address rides on it). Say plainly it's a one-time setup session, not a quick deploy.

**There is no sending domain to onboard and no DNS to change.** Cloudflare's `send_email`
binding lets a Worker mail only addresses the owner has *proven they control*, so the
recipient is the anti-abuse gate and the `From` needs no SPF/DKIM/verification — `LEAD_FROM`
can be any address on the owner's domain. Only `LEAD_TO` gets verified.

1. **Verify the owner's inbox as a Destination Address** (dashboard → Email → Email
   Routing → Destination Addresses → Add). Cloudflare emails a link; the owner clicks it —
   it's their own inbox, so one click. **Leave Email Routing *disabled* and do NOT touch
   MX records:** verification works with routing off, and on a domain with existing mail
   (Google Workspace, etc.) changing MX would break real email. Routing is an inbound
   product; `send_email` doesn't use it.
2. **Create a Turnstile widget** (dashboard → Turnstile → Add). The **sitekey** (public,
   fine to commit) replaces the test-key fallback in `LeadForm.astro`; the **secret**
   never touches git:
   ```bash
   pnpm exec wrangler secret put TURNSTILE_SECRET
   ```
   → the secret stores against `wrangler.toml` config — no prior deploy needed, so this can
     run before the first publish. Local `pnpm dev` / `pnpm dev:full` keep the always-pass
     test key automatically (via `.env.development`), so the form still works locally after
     go-live — production uses the real sitekey, local uses the test key, no manual toggle.
3. **Deploy** — `pnpm deploy` (per Publish above).
4. **Send a live test — non-optional.** Submit a real enquiry through the live form and
   **the owner confirms it arrived** in their inbox, visitor address as Reply-To. A passing
   form is *not* proof of delivery: if `EMAIL.send()` fails the visitor still lands on
   `/thanks` and sees success, so only a received email closes the gate. Record it as `Last
   verified` below. Didn't arrive? `pnpm exec wrangler tail` streams the live Worker logs to
   diagnose.
5. **Say what protects it, once, in plain outcomes.** Owners get asked "is it secure?"
   and have no answer unless given one now: *"The form checks every visitor is a real
   person before anything reaches your inbox, and the site keeps no database — there's
   nothing for an attacker to break into."* One line at go-live, no jargon; the technical
   version lives in the `Protection` line of the record below.

If the dashboard UI has moved (Email is under active development), follow the current flow;
the contract is unchanged: **a verified destination + a stored Turnstile secret** — no
sending domain, no MX change. The owner's notification address lives in `wrangler.toml` `[vars]` as
`LEAD_TO` (committed config, not a credential); if the owner would rather keep it out of
git, promote it to a secret (`wrangler secret put LEAD_TO`) and drop it from `[vars]`.

## Record it

Write `docs/website/deploy.md` (overwrite each publish):

```markdown
# Deploy

- Platform: cloudflare-workers

## Canonical deployment
<!-- The one copy that owns `site`, the custom domain, and the SEO identity. -->
- Account ID: <account_id from wrangler.toml — the account this lives under>
- Project: <name from wrangler.toml>
- URL: <live url — custom domain if attached, else *.workers.dev>
- Last deployed: <YYYY-MM-DD>
- QA passed: <YYYY-MM-DD>

<!--
## Mirrors
Add a block per non-canonical copy under another account. A mirror's pages still
point their canonical/OG URLs at the canonical deployment above (it's a duplicate to
search engines) — second-class by construction. See troubleshooting/deploy-account.md.
- Account ID: <other account>
- Project: <name>
- URL: <*.workers.dev under that account>
- Last deployed: <YYYY-MM-DD>
-->

## Lead capture
<!-- Omit this whole section if the site has no capture form. -->
- Provider: cloudflare-email
- Notification address: <owner email submissions land in — the verified Destination Address>
- From domain: <the owner's Cloudflare zone the From address sits on; no onboarding>
- Turnstile sitekey: <public sitekey>
- Protection: honeypot + server-side Turnstile; no database — leads land only in the inbox
- Last verified: <YYYY-MM-DD a live test was confirmed received>
```

This is the end of the road. Changing the live site later uses the same three lanes
(SKILL.md "Changing a live site"): audit scoped to what changed, the go-ahead again,
publish, refresh this record.
