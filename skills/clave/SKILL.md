---
name: clave
description: Build and run websites with Astro and Tailwind CSS. Keeps a system of record in docs/ — business truth at the root, site-specific specs under docs/website/ — and runs a staged build pipeline (discovery, brief, design, voice, build, qa, deploy) over it, so intent persists on disk across sessions. Use when the user wants to create, assemble, extend, or ship a website — and equally when they want to iterate on, polish, tweak, redesign, or maintain an existing one (copy changes, design changes, QA, redeploys), add a spam-filtered contact/lead-capture form, or whenever the repo has a docs/ system of record managed by this skill. Always uses Astro + Tailwind, deploys to Cloudflare. Ships with frontend-design guidance built in — no companion skills required.
---

# Clave

Build production-ready websites with **Astro + Tailwind CSS**.

The durable product is the **system of record** in `docs/`: spec files that say what is
true and a deploy record that says where it runs. Why it became true lives in git — a
spec edit is the record. The build pipeline below is the first workflow over that record —
later workflows
(maintenance, SEO, new features) read and extend the same files. Intent lives on disk,
not in the conversation: a new session (or a new developer) picks up from `docs/`, never
from memory.

## Talking to the driver

**You are a capable technical agent.** This skill is written to you, tersely,
agent-to-agent — it states a rule and the reason behind it and trusts you to apply
judgment. Don't read it as a script to recite; read it as the model, and act.

The **driver** — whoever is steering this run — is a *different person from you*, and the
one variable the whole run keys off. They may be another agent, an engineer, or a
non-technical business owner who has never typed `git`. You speak and stop differently for
each. Infer which from their **first message and the project probe** — never interrogate
("are you technical?" is itself the wrong register). These are output modes, not personas
to quiz the driver about:

| Register | Who | How you speak | Stops & dials |
|----------|-----|---------------|---------------|
| **Calling agent** | A structured/imperative prompt, no human in the loop | Silent; return artifacts, not narration | Defaults; no checkpoints past pre-deploy — make the call and keep moving |
| **Technical human** | git/pnpm/Cloudflare vocabulary in their ask | Plain, peer-to-peer; jargon is fine | May surface the full target & checkpoint dials |
| **Non-technical owner** | "I need a site for my bakery" — no machinery vocabulary | Plain outcomes only; **hide git/pnpm/Cloudflare entirely**; narrate results ("saved this version", "it's live"), never mechanics | Default deploy; fewer stops; **don't show the target menu** — it's vocabulary they don't have |

The **non-technical Clave owner is the anchor** — the common case, the one to be explicit
and supportive about. The skill still **requires a technical operator** in the repo, but
that operator may be acting *for* a non-technical owner: speak to the owner, run the
machinery silently. A driver in the middle is **your call** — it always is; the registers
are defaults to read the room with, and the in-between is where your judgment earns its
keep.

**Pick at kickoff, hold unless redirected.** Set the register once from the opening
signals and stay there — don't re-judge tone every message. A *redirect* moves it: the
bakery owner who suddenly says "push to main" just told you they're more technical than you
guessed; adjust without ceremony. Read nudges, don't re-interrogate.

## Stack (non-negotiable)

- **Astro** — file-based routing, `.astro` components, islands only where needed.
- **Tailwind CSS** (v4) — utility classes; tokens in the `@theme` block of
  `src/styles/global.css`.
- **Mobile-first** — always. Base utilities target mobile; `sm:`/`md:`/`lg:` scale up.

Sites are scaffolded from the **pinned starter in this skill's `template/` directory** —
a version set verified end-to-end, with baked-in screenshot (`pnpm shots`), smoke
(`pnpm smoke`), and accessibility (`pnpm audit`) scripts. The tooling is versioned
with each site, so old sites keep working regardless of skill upgrades. Scaffolded sites
are **pnpm-based** (the build stage installs pnpm via npm, once); only the skill installer
itself uses npm/npx.

## Where this runs (the site root)

This skill operates on **one directory — the *site root*** — which *is*, or becomes, the
site's own git repo. You run inside it (cd there first; if it doesn't exist yet, the build
stage creates and scaffolds it). Everything the skill touches lives under it, in three
territories with deliberately different ownership:

| Under the site root | What | Ownership | Committed? |
|---------------------|------|-----------|------------|
| `docs/` | The system of record — business truth + per-channel specs | **Human-owned** (source of truth) | yes |
| repo root (`src/`, `public/`, `astro.config.mjs`, …) | The built Astro site | Agent-owned, regenerable | yes |
| `.clave/` | Agent working artifacts — `skeletons/` (kept design archive) + `scratch.md` (local notes) | Agent-owned | `skeletons/` yes, `scratch.md` no |

`docs/` stays **at the root, visible and human-editable** — it's the durable product, never
hidden in a dotfolder. `.clave/` is the opposite: Clave's own working namespace, kept out
of the way. Transient QA captures live in `.qa/` (gitignored), not the record.

The site root **is the repo root** — the site and its `docs/` share one repo. Read every
"the site root" below as "the repo root."

## The system of record (`docs/`)

Two levels: **business truth** at the root (channel-agnostic — every workflow reads it)
and **channel artifacts** in a subdirectory per workflow. The website is the first
workflow; future ones (`docs/seo/`, `docs/analytics/`, …) are siblings reading the same
root.

| File                      | What it is                                       | Written by |
|---------------------------|--------------------------------------------------|------------|
| `docs/discovery.md`       | Truth about the product and its customers        | discovery  |
| `docs/voice.md`           | How the brand sounds — everywhere, not just here | voice      |
| `docs/assets/`            | Provided materials — logo, brand, photos, copy   | the human  |
| `docs/website/brief.md`   | The plan for this site                           | brief      |
| `docs/website/design.md`  | How every page looks                             | design     |
| `docs/website/deploy.md`  | Where it runs — target, project, URL, last QA; lead-capture config when present | deploy     |
| site root (`src/`, `public/`, …) | The built Astro site                      | build      |

**State is derived — no separate status to maintain.** A stage is done when its artifact
exists. QA is the exception: a **gate, not an artifact** — the deploy record is the
evidence it passed. To resume: the next stage is the first whose artifact is missing; if
the site is built but there's no deploy record, pick up at the first-build checkpoint.

**Drift — the disk may not be what the pipeline assumes.** Derived-state resumption trusts
the artifacts on disk; a hand-edited site, a half-finished session, or a collaborator can
make a spec and the site it governs disagree. On resume, after the probe, **glance for
spec↔site divergence** and triage it with the same question the three lanes ask — *what
does the spec say?*

- **Cosmetic / below spec altitude** (the Polish lane — a tweak `design.md` never
  pinned): not drift; note it in a line and proceed, spec stays truth.
- **Material contradiction** (the site contradicts what a spec *positively asserts* —
  `design.md` names one primary color, the markup hardcodes another; brief says 4 pages,
  6 exist): **surface it and ask which side wins** before building on it — don't silently
  extend a record that's already inconsistent.
- **Strict re-sync on demand** (driver asks to "re-sync" / wants a clean reconcile): run
  the bidirectional pass in [troubleshooting/resync.md](troubleshooting/resync.md).
Default is tolerant of nudges, strict only when it matters or when asked — same spirit as
"iterate first, audit last."

## Checkpoints (where the pipeline stops)

The pipeline stops for input at fixed points; everything between them runs without asking.
Whoever drives answers. How many of these stops they get, and in what vocabulary, is set
by their register — see [Talking to the driver](#talking-to-the-driver): a calling agent
runs silent on defaults, a technical human can turn the dials up, a non-technical owner
gets fewer stops and plain narration.

- **Direction pick** (design stage) — choose between 2–3 skeleton directions. Default: on.
- **First-build review** (after build's smoke check) — the site in hand, fast. Iterate
  look and copy here, before any deep audit. Default: on.
- **Pre-deploy** — always on. Never deploy without an explicit go-ahead. No preference
  can turn this off. **Save here:** right before every deploy, the agent commits the
  current state (and pushes, if the target has a remote) — so the saved/pushed state
  always equals what's live, and the git history reads as exactly the sequence of what
  shipped. The agent runs git itself; the owner never types it. Narrate it plainly —
  *"Saved this version before publishing"* — not in git jargon. This is the **only**
  routine commit: iteration in between stays uncommitted (polish is "change freely, no
  ceremony"), squashed into one meaningful "what we shipped" save at deploy. A run that
  never deploys (explore, build-only) never commits — its state is the working tree; say
  so if the driver opted out of a remote. Stuck (no remote yet, push rejected, "what's a
  commit?") → [troubleshooting/git.md](troubleshooting/git.md).
- **Per-artifact approval** (discovery, brief, design spec, voice) — for drivers who
  want to shape every word. Default: off; turn on when asked.

At kickoff, state the stop plan in one line and let the driver adjust: *"I'll stop at:
direction pick, first-build review, and before deploy — want more or fewer stops?"* This
preference is **conversational, not part of the record** — it's about this run; on
resume, restate the defaults and re-ask.

At a checkpoint that's turned off: **don't ask** — make the best call and keep moving.

## Target (how far this run goes)

Derived state tells you *where you are* (which artifacts exist); the **target** says *where
you're going*. Default is the full road — **deploy**: run every stage. Most
drivers say nothing and get that.

A driver who wants less sets a target — it's not a separate mode, just two dials:

- **Stop after** `design` / `build` / `deploy` — the terminal stage. Stages past it don't
  run. *Stop after design* is exploring skeletons (a look, no site); *stop after build* is
  a local site you preview but don't ship; *stop after deploy* is the full road.
- **Git remote?** — version the source and `docs/` on the owner's own remote (default on
  for publish). Independent of where the road ends: you can build locally *with* a remote,
  or publish *without* one. See the git-remote step in [build](stages/build.md).

(Per-artifact approval is the third dial — it already lives in Checkpoints above.)

The target is a **soft declaration, not a lock.** It gates which stages run and therefore
which prerequisites ever get checked — *stop after design* never touches pnpm, git, or
Cloudflare (this is why prereqs are checked lazily, per stage, not up front). Each stop is
a **prefix of the next**, so moving the goalpost later is free and lossless: artifacts
already on disk are reused, the road just extends. Record the target in one line at the top
of `docs/website/brief.md` (`Target: build, no remote`) so a resumed session honors it
instead of re-deriving deploy as the assumed destination; re-ask if it's absent.

## The pipeline (build workflow)

Run in order **up to the target's terminal stage**; each stage reads what came before.
**To run a stage:** read its detail file, do the work, write its artifact. Read upstream
artifacts from disk — never re-derive them from memory. Each stage states its **Prereq**
and checks it on entry; if it's missing, see
[troubleshooting/prerequisites.md](troubleshooting/prerequisites.md).

| Stage     | Reads                  | Writes                    | Detail file                                |
|-----------|------------------------|---------------------------|--------------------------------------------|
| discovery | user request           | `docs/discovery.md`       | [stages/discovery.md](stages/discovery.md) |
| brief     | discovery              | `docs/website/brief.md`   | [stages/brief.md](stages/brief.md)         |
| design    | brief                  | `docs/website/design.md`  | [stages/design.md](stages/design.md)       |
| voice     | brief                  | `docs/voice.md`           | [stages/voice.md](stages/voice.md)         |
| build     | brief + design + voice | Astro site in site root   | [stages/build.md](stages/build.md)         |
| qa        | built site + specs     | nothing — pre-deploy audit | [stages/qa.md](stages/qa.md)              |
| deploy    | passing QA + user go-ahead | `docs/website/deploy.md`  | [stages/deploy.md](stages/deploy.md)   |

Order: `discovery` (truth about product/customer) → `brief` (plan for this site) →
`design` + `voice` (independent — either order; both read only the brief) → `build`
(needs all three specs) → `qa` (is it broken? is it right?) → `deploy`.

A stage is interchangeable as long as it reads the same upstream artifacts and writes to
the same path — e.g. a deploy variant is just `stages/deploy-<target>.md`.

## How the pipeline loops (three lanes)

The stages are a linear **happy path**, but building a real site involves rework. Triage
every piece of feedback or finding by asking one question — **what does the spec say
about this?** — into one of three lanes:

- **Fix (the spec already answers it):** the code disagrees with a good spec — broken
  layout, wrong color in markup → fix in `build`, re-check. No spec edits.
- **Polish (the spec is silent):** below spec altitude — spacing in one section, a flat
  headline, card composition. **Change the code freely; no ceremony.** Most iteration
  lives here. One capture rule: if the driver *rejected* something that could plausibly
  recur on another page, append a one-line ruling to design.md's **Do / don't** or
  voice.md's word bank. That's the whole test — could the mistake repeat? One line.
  One-off? Nothing.
- **Revision (the spec is wrong):** the direction is off, the copy needs new
  positioning, a token must change site-wide → **update the spec file**, rebuild. Going
  backward is allowed, but it must change a spec — that edit, in git, is the record.
  Editing a spec is the difference between deliberate revision and thrashing: thrashing
  is repeated undo against an unchanged spec; revision moves the spec and the site follows.

**Iterate first, audit last.** Look-and-feel iteration happens at first-build, guarded
only by build's smoke check. The heavy qa stage runs **once**, at ship time — not between
iterations, where the next "make it darker" would throw its findings away.

**Exit condition:** when the driver wants to ship, run qa and loop fixes until a run yields
**zero findings against the current build**, then ask for the deploy go-ahead (explicit
yes only). Don't keep revising a passing site. If the same issue loops ~2–3 times without
converging, surface it to the driver instead of looping further.

## Changing a live site

Iteration after deploy uses the **same three lanes** — being live doesn't change how a
change is made, only how it exits: re-run the qa gate **scoped to what changed** (a typo
fix doesn't re-audit the whole site), get the explicit deploy go-ahead again, redeploy,
and refresh `docs/website/deploy.md`. Reversing shipped state still goes through the
Revision lane — edit the spec, then rebuild; the spec edit in git is the record.

## File authority (don't clobber human work)

Spec files under `docs/` are the source of truth, and humans edit them too — treat them as
human-owned:

- A stage may **draft** its own spec file when first creating it.
- After that, **never overwrite a human's edits silently.** If a spec already exists and
  you need to change it, show the proposed diff and confirm before replacing — or make
  the smallest targeted edit. Preserve human wording and intent.
- `docs/assets/` holds provided originals (logo, brand material, photos, copy docs) —
  **read-only**. Stages check it before generating anything; build copies what it uses
  into the Astro project (`src/assets/` or `public/`), never edits or deletes originals.
- The built site (the site root) is agent-owned — regenerate it freely.

When in doubt, the human's words in a spec win.

## Why-history lives in git, not a log

Spec files are the mutable snapshot ("what is true now"). There is **no separate decision
log** — the why lives in git: every Revision is a spec edit (see the three lanes), and the
diff plus commit message is the record of what changed and, at ship time, why. To recover
intent, read the spec and `git log`/`git blame` it. The discipline that keeps this honest
is the Revision rule — *go backward only by editing a spec* — not a parallel ledger.

## Start here

1. Probe the project in **one compound call**, not six round-trips:
   ```bash
   ls -a; git status -sb 2>/dev/null; ls docs 2>/dev/null; cat package.json 2>/dev/null
   ```
2. Kickoff (no artifacts yet): **read the driver before you write the plan.** Set the
   register from the first message + the probe — calling agent, technical human, or
   non-technical owner (see [Talking to the driver](#talking-to-the-driver)); it decides
   how this run sounds and how much you show. A calling agent skips the rest of this step
   and runs on defaults. For a human, **confirm an inferred plan in one line, don't present
   a menu** — same rule as
   discovery ("confirmations beat questions"): *"Sounds like you want me to build and ship
   a site for the bakery — I'll handle the technical bits and check in when there's
   something to look at. Go?"* Default **deploy**; infer a shorter target when obvious
   ("just play with some looks" → stop after design). Proceed unless corrected — a wrong
   guess costs one correction, not a battery of questions. Ask whether existing materials
   are available (point them at `docs/assets/`), then go.
3. Look in `docs/` — the next stage is the first whose artifact is missing, **capped at
   the target's terminal stage** (read it from the top of `brief.md`; absent → re-ask,
   default deploy). If a remote is shared (collaborators), `pull` first so derived state
   reflects their artifacts, and **check for drift** (see "Drift" above) before trusting
   what's on disk. Site built to target but no `docs/website/deploy.md` and target is
   deploy? Pick up at the first-build checkpoint. Everything exists and the driver wants
   changes? That's **Changing a live site** (above).
4. Read that stage's detail file and run it.
