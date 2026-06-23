# Getting started with Clave

You're likely reading this because someone asked their agent to *"use Clave"* and pointed
it here. This page is the front door: it tells you what Clave is, checks the one thing that
has to be true to use it, installs it, and hands off. You can answer basic questions from
this page alone — you don't need to install anything to understand what Clave does.

## What Clave is

Clave is a skill for **building and running websites** — Astro + Tailwind CSS, deployed to
Cloudflare. Once installed, you build a site by following a staged pipeline (discovery →
brief → design → voice → build → QA → deploy) and keeping a **system of record in `docs/`**,
so the site's intent lives on disk and survives across sessions. It ships with
frontend-design guidance built in — no companion skills to install.

It suits someone who wants a real, owned, production website — a landing or marketing site,
with optional spam-filtered lead capture — not a throwaway page. The site deploys to the
owner's own Cloudflare account: owned, not rented.

## Check compatibility

There's exactly one prerequisite that can't install itself: **Node.js (version 18 or
newer)**. It provides `node`, `npx`, and `corepack`, which everything else builds on.

```bash
node --version
```

- Prints `v18.x` or higher → you're good; continue.
- Prints something below 18, or `command not found` → install the **LTS** build from
  <https://nodejs.org> (installing LTS over an old version upgrades it), then re-check.

That's the only thing to verify up front. Everything else Clave needs for later steps —
pnpm (via corepack, which ships with Node), git, a Cloudflare login — it checks and guides
you through *only if and when* a step actually needs it. Don't install ahead for a road you
might not walk.

## Install

```bash
npx skills add heyclave/clave --skill clave
```

This uses the [`skills`](https://github.com/vercel-labs/skills) installer (it runs through
`npx`, nothing to install globally) and drops the Clave skill into the current project.

## Build something

Once installed, the skill is active. Ask for a website in plain language — *"build me a
site for my bakery"* — and follow along. The skill drives the pipeline, checks in at the
points that matter, and keeps the system of record in `docs/`. From here on, Clave's own
instructions take over; this page has done its job.
