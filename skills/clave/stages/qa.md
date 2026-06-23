# Stage: QA

**Reads:** the built site + `brief.md` + `design.md` + `voice.md`. **Writes:** nothing —
this is a **gate**, not an artifact. The deploy record is the evidence it passed.

**Runs once, when the driver says ship** — not between look-and-feel iterations (build's
smoke check covers those). Tooling failures never block: if a check's tool is missing,
note it and review the markup directly.

## Capture once, check everything from it

- [ ] Capture every page from the brief, then check from the artifacts:
      ```bash
      pnpm shots / /about ...    # mobile + desktop full-page screenshots
      pnpm audit / /about ...    # axe-core accessibility scan
      ```
      → also collect rendered HTML and console errors

**Is it broken?** (universal — all objective):

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
      voice — not just pass the boxes above? This is the one check a checklist can't
      make for you; look at the page as the target customer and decide.

## Lead-capture gate (only if `brief.md` has a `## Lead capture` section)

Email can't be delivered from local dev, so this gate has two halves and **doesn't break
the QA → deploy order**: the static checks below are part of the pre-deploy QA loop; the
live send-and-confirm is the **last step of deploy provisioning** (deploy.md step 4), run
right after the deploy go-ahead. QA passing means the static half passed and the live test
is ready to run — it's the deploy step that closes it.

Pre-deploy (here, statically — no email sent):

- [ ] **Form is accessible** — every field labelled, focus order sane, error announced
      (`role="alert"`), tap targets ≥ 44px
- [ ] **Wiring is right** — `method="POST" action="/api/lead"`, honeypot + Turnstile widget
      present, fields match the brief, `wrangler.toml` lead-capture block uncommented with
      `LEAD_TO`/`LEAD_FROM` set
- [ ] Exercise the flow with `pnpm dev:full` — honeypot drops silently → `/thanks`; missing
      Turnstile → rejected

At deploy (live — see deploy.md step 4): submit a real enquiry through the deployed form and
**the owner confirms it arrived**, visitor address as Reply-To. That confirmation, recorded
as `Last verified` in `deploy.md`, is the evidence the gate passed — not a self-check.

## Then loop

Report findings (severity, page, issue, fix) and route each via the three lanes (SKILL.md):
code drifted → fix in build; spec is wrong → edit the spec, rebuild.
Loop until a run yields **zero findings against the current build**, then hand to deploy
(which needs the driver's explicit go-ahead).
