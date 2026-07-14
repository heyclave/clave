# Stage: Build

**Reads:** `docs/website/brief.md` + `docs/website/design.md` + `docs/voice.md`.
**Writes:** the Astro site in the site root (see SKILL.md "Where this runs"), and
`.clave/clave.json` (the version ledger — see [record the building version](#record-the-building-version)).

**Prereq:** **pnpm** (via corepack — the scaffold activates it; nothing installed
globally) and **git** (for the saves; the remote below also wants a GitHub account).
Check on entry; if either is missing or too old, see
[troubleshooting/prerequisites.md](../troubleshooting/prerequisites.md) and guide the owner
through it before scaffolding.

Build with **Astro + Tailwind**, mobile-first, against the three specs — `design.md` how it
looks, `voice.md` how it reads, `brief.md` the job, value prop, and CTA.

## Scaffold checklist (once)

- [ ] Copy the pinned starter (the `template/` dir next to SKILL.md) into the site root and
      activate pnpm:
      ```bash
      cp -R <path-to-this-skill>/template/. .
      mv gitignore .gitignore
      corepack enable pnpm   # activates the pinned pnpm; ships with Node, nothing installed globally
      pnpm install
      ```
      → idempotent — if design already scaffolded (it copies the same template to serve
        skeletons before `pnpm install`), the `cp` just refreshes; this is the run that
        installs. `corepack enable pnpm` is a shim for the version `package.json` pins via
        `packageManager`, not a global install; `pnpm install` writes `pnpm-lock.yaml`,
        which is **tracked** (the lockfile is the pin) and rides into the ship save
- [ ] **Merge**, don't overwrite, if `AGENTS.md`/`CLAUDE.md` already exist — they're
      human-owned; the template ships them so future sessions auto-load the skill
- [ ] **Never bump to `@latest` while building** — the template pins a set verified
      end-to-end (Astro 5 + Tailwind 4 + Playwright); upgrading is its own deliberate task

The template provides:

- `pnpm dev` / `build` / `preview` / `check` — the standard Astro loop.
- `pnpm skeletons` — serves `.clave/skeletons/` over http for the design stage's direction
  pick (stdlib Node, no build, no Astro). Owned by the design stage, not here.
- `pnpm shots [route ...]` — self-contained mobile + desktop screenshots to `.qa/`.
- `pnpm smoke` — `check` + `build` + `shots` in one call.
- `pnpm audit [route ...]` — axe-core accessibility scan.
- `pnpm deploy` — `build` + `wrangler deploy`. Owned by the ship stage, not here.
- `pnpm dev:full` — `build` + `wrangler dev`; runs the lead-capture worker locally
  (only meaningful on sites with a form). Plain `pnpm dev` stays the look-and-feel loop.
- Design tokens in the `@theme` block of `src/styles/global.css` (no `tailwind.config`).
- Technical SEO baked in (canonical + Open Graph, sitemap, robots, 404) — activates once
  `site` is set in `astro.config.mjs`.

## Version control & remote

The source and the `docs/` system of record are the durable, owned truth — version them.

- [ ] `git init` if not already a repo — so the ship save has somewhere to land
      → the guaranteed save is before every publish (the one routine commit); an initial
        commit here is fine but optional, don't commit through iteration
- [ ] **Offer the off-site copy once, plainly:** *"Want me to keep a saved copy of the
      site on your own account, so it survives this computer and someone you trust could
      pick it up?"* — an owner who declines can add it later, losslessly (the road just
      extends). On yes, default to **GitHub** (best agent tooling; free private repos),
      on the owner's own account — owned, not rented. With `gh` installed:
      ```bash
      gh repo create <name> --private --source=. --remote=origin --push
      ```
      Without `gh`: the owner creates an empty private repo in the web UI, then
      `git remote add origin <url> && git push -u origin main`. Prereqs (git, a free
      account, optional `gh`):
      [troubleshooting/prerequisites.md](../troubleshooting/prerequisites.md).

This is independent of publishing: the remote is where the *source* lives; Cloudflare
(ship) serves the *built site* and needs no git. They're separate decisions.

## Build rules checklist

- [ ] **Read all three specs from disk first** — `brief.md` (job, value prop, CTA),
      `design.md` (look), `voice.md` (copy)
      → never re-derive design or copy from memory
- [ ] **Mobile-first** — base utilities target mobile, add `sm:`/`md:`/`lg:` to scale up;
      no horizontal scroll, tap targets ≥ 44px, body ≥ 16px
- [ ] Map `design.md` tokens into the `@theme` block **once**, then use the generated
      utilities (`bg-background`, `text-primary`, …) — never hardcode off-spec values
- [ ] One `.astro` component per section
- [ ] Use `docs/assets/` originals by **copying** into `src/assets/` or `public/` — never
      edit or move them
- [ ] Spec doesn't cover a case? **Add to the spec first, then build** — don't improvise

## Lead capture (only if `brief.md` has a `## Lead capture` section)

The template ships the pieces — wire them up; don't reinvent them. **Skip this whole
section if the brief has no `## Lead capture`.**

- [ ] **Form** — use `src/components/LeadForm.astro`; edit its fields to match the brief's
      captured list and place it where the brief says (often a `#contact` section)
      → **never improvise fields beyond the brief.** Keep the honeypot (`lead_hp`), the
        Turnstile widget, the error banner + its code→copy map, and
        `method="POST" action="/api/lead"`
- [ ] **Copy** — replace template placeholders (labels, submit button,
      `src/pages/thanks.astro`, error text) from `voice.md`; accessible `<label for>` on
      every field
- [ ] **Worker** — keep `worker/index.js` + `worker/email.js` as shipped (site-agnostic,
      config from env)
      → don't edit worker code per site; to change provider later, swap `email.js` (the
        adapter seam)
- [ ] **Config** — in `wrangler.toml`, uncomment `main`, `binding`, `run_worker_first`,
      `[[send_email]]`, and `[vars]`; set `LEAD_TO` (brief's notification address) and
      `LEAD_FROM` (an address on the verified sending domain — placeholder fine until the
      domain is onboarded at ship)
      → `binding`/`run_worker_first` ship commented (an assets-only site must omit
        `binding`); a form needs all five uncommented. The **Turnstile secret is *not* a
        var** — ship stores it via `wrangler secret put`, so leave it out of `[vars]`
- [ ] **Test locally** — `cp dev.vars.example .dev.vars` (gitignored; ships Turnstile test
      keys that always pass), then `pnpm dev:full` to exercise the form
      → email isn't sent locally — live delivery is verified at ship; plain `pnpm dev`
        stays the look-and-feel loop

## Smoke check, then milestone 3

- [ ] Run `pnpm smoke` (`check` + `build` + `shots`)
- [ ] Read `.qa/`: tokens match `design.md`, no horizontal scroll, nothing cut off or
      overlapping
- [ ] Fix the clearly-broken and repeat
      → this is a smoke check, **not an audit** — the heavy audit runs once, at ship time
- [ ] **Milestone 3 of 4 — it's real.** Show the owner the dev URL + screenshots and
      invite changes: *"This is the best moment to change things — words, pictures,
      colours, layout. Nothing is precious yet."*
      → this is where look and copy get iterated (the three lanes — see SKILL.md); take
        feedback as a batch, apply, re-shoot, repeat

## Record the building version

Once the build succeeds (smoke passes), write your **installed** version (`SKILL.md`
frontmatter `version:`) into `.clave/clave.json` as `claveVersion` — creating the file on a
brand-new site, updating it on a rebuild. This is the version that *actually built* the
site, so:

- Write it only after a successful build, and only the version **running this session** —
  never a version merely downloaded via an accepted update offer (that takes effect next
  session; see [troubleshooting/versioning.md](../troubleshooting/versioning.md)).
- **Preserve any `pinVersion`** already in the file — it's a human-set field; only touch
  `claveVersion`.
- `.clave/clave.json` is committed by default (it rides into the ship save); only
  `.clave/scratch/` is gitignored.

```json
{ "claveVersion": "0.1.0" }
```

**Next:** [ship.md](ship.md) — when the owner wants to go live: audit, then publish.
