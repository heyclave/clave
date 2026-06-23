# Clave

An agent skill for building and running websites — **Astro + Tailwind CSS**, deployed to
Cloudflare, with frontend-design guidance built in.

You don't run Clave yourself. You install it into a coding agent (Claude Code and other
agents that support the [`skills`](https://github.com/vercel-labs/skills) installer), then
ask the agent to build you a site. It
follows the skill: discovery → brief → design → voice → build → QA →
deploy, keeping a **system of record in `docs/`** so the site's intent persists on disk
across sessions — a new session, or a new developer, picks up from `docs/`, never from
memory.

## Install

```bash
npx skills add heyclave/clave --skill clave
```

Then, in that repo, ask your agent to build a website. The only prerequisite that can't
self-install is [Node.js](https://nodejs.org) (LTS) — everything else the skill checks and
sets up lazily, when a stage that needs it runs.

## What you get

- **Astro + Tailwind**, pinned and verified end-to-end — no version roulette.
- **A system of record in `docs/`** — business truth at the root, site specs under
  `docs/website/`. Specs are human-owned; the site follows them. Why something changed
  lives in git: a spec edit *is* the record.
- **A staged pipeline** with checkpoints you control — explore some looks, build a local
  preview, or go all the way to a deployed site, your call.
- **Spam-filtered lead capture** (optional) and accessibility/screenshot checks that ship
  inside each generated site.
- **Cloudflare deploy** to the owner's own account — owned, not rented.

## What's in this repo

This repository is the **source of the skill**, not a website and not an app — there is
nothing to build or run here. The deliverable is `skills/clave/`:

- [`skills/clave/SKILL.md`](skills/clave/SKILL.md) — the entry point: the product model,
  the pipeline, the iteration lanes, the checkpoints. Start here.
- `skills/clave/stages/` — one file per pipeline stage.
- `skills/clave/troubleshooting/` — recovery guides, read only when a check fails.
- `skills/clave/template/` — the pinned Astro starter the skill copies into your new site.
- `skills/clave/design/` — frontend-design guidance, vendored from
  [`anthropics/skills`](https://github.com/anthropics/skills).

Contributing or editing the skill? Read [`AGENTS.md`](AGENTS.md) first.

## License

[MIT](LICENSE). The vendored design guidance under `skills/clave/design/` is Apache-2.0
(see `skills/clave/design/LICENSE.txt`).
