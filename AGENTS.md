# AGENTS.md

## What this repo is

This is **not an application** — it is the source for a distributable **agent skill**.
The deliverable is `skills/clave/`: Markdown instructions plus a pinned Astro starter that
an agent installs (`npx skills add <org>/<repo> --skill clave`) and then follows to build
websites in *other* repos.

So there is **nothing to run or test here.** This repo has no `package.json`, no
dependencies, no build. Working on it means editing the **instructions a future agent will
follow** — prose and config. The audience for almost every file is that agent, so a change
is judged on whether it makes the agent behave correctly, not on whether code compiles. The
whole Astro / Tailwind / pnpm / Cloudflare stack you'll read about lives *inside the
template* and only runs in a scaffolded site — never here.

## Layout

- `skills/clave/SKILL.md` — the entry point and the one file to read first. It defines the
  whole product model: system of record, pipeline, the three iteration lanes, checkpoints.
  Everything else elaborates it.
- `skills/clave/stages/*.md` — one detail file per pipeline stage (discovery, brief,
  design, voice, build, qa, deploy). The agent reads one when it runs that stage.
- `skills/clave/troubleshooting/*.md` — off-happy-path recovery (prerequisites, git,
  resync), read only when a check fails.
- `skills/clave/design/` — `frontend-design.md`, the aesthetic playbook **vendored
  verbatim** from `anthropics/skills` (+ its `LICENSE.txt`). Shipping it inside the skill is
  what makes the install self-contained; re-sync by re-copying the upstream file over it,
  keeping the provenance header.
- `skills/clave/template/` — the pinned Astro starter (see below).
- `skills/clave/getting-started.md` — the **front door**, and the one file written to be
  read *outside* this repo. It's meant to be hosted standalone (e.g.
  `heyclave.com/getting-started.md`) and fetched by an agent *before* the skill is
  installed — the user prompts *"use Clave, follow heyclave.com/getting-started.md"* and the
  agent orients, checks compatibility, installs, and answers basic questions from this file
  alone. Two constraints follow: it must be **self-contained** (no relative links into this
  repo — they 404 when hosted; if you must point somewhere, use an absolute URL), and it
  must be **minimal** — only what's needed to go from nothing to a running skill. Everything
  past install (pnpm/corepack/Playwright mechanics, the prereqs for later stages) belongs in
  the skill, reached lazily, not here.

## The template (`skills/clave/template/`)

The **only runnable code in the repo** — but it doesn't run *here*. It is copied verbatim
into a user's new site by the build stage, and everything in it (Astro, Tailwind, the
`pnpm` scripts, the lead-capture worker, the Cloudflare config) executes in *that* site.
When editing it, three things matter:

- It is **deliberately pinned** — exact versions in `package.json`, verified end-to-end.
  Never bump to `@latest` casually; upgrading the stack is its own deliberate task.
- Some files ship *as* the user's site config: `CLAUDE.md` / `AGENTS.md` auto-load the
  skill in scaffolded sites (not instructions for here), and `gitignore` is renamed to
  `.gitignore` on scaffold.
- How each piece behaves once live (the `pnpm` scripts, lead capture, SEO, `.clave/`) is
  documented where it's used — in the stage files and the template's own files. Don't
  restate it here.

## Editing conventions

- **Match the existing prose.** The Markdown here is dense, declarative, and reasoned — it
  states a rule *and why it exists*. Keep that density; don't pad with generic advice.
- **The product model is defined in SKILL.md — read it before editing a stage.** A stage
  file's correctness depends on the whole model (system of record, three lanes,
  checkpoints), and you can't change one coherently without holding it.
- **Tables in SKILL.md are contracts.** If you change a stage's inputs/outputs or a file's
  role, update the matching row in SKILL.md's tables in the *same* edit. Drift between a
  stage and those tables is the main failure mode.
- **Happy path inline, exceptions on demand.** The path an agent walks lives in SKILL.md
  and the stage files. Anything off it — prerequisite install, failure recovery, API drift
  — goes in `troubleshooting/*.md`, linked from the one inline line that triggers it. Don't
  inline it back.
- **New deploy targets are siblings, not edits.** Add `stages/deploy-<target>.md` next to
  the default rather than branching the existing deploy stage. Same for any swappable stage.
