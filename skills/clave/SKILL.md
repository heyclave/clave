---
name: clave
version: 0.1.0
description: Build and run websites — landing and marketing sites with Astro + Tailwind CSS, live on the owner's own Cloudflare account. Keeps a system of record in docs/ (business truth at the root, site specs under docs/website/) and walks a staged pipeline over it (discovery → brief → design → voice → build → ship), so intent persists on disk across sessions. Use when the user wants to create, build, or ship a website; iterate on, polish, or maintain an existing one (copy changes, design changes, redeploys); add a spam-filtered contact/lead-capture form; or whenever the repo has a docs/ system of record managed by this skill. Ships with frontend-design guidance built in — no companion skills required.
---

# Clave

Build production-ready landing and marketing sites with **Astro + Tailwind CSS**, live on
the owner's own Cloudflare account — owned, not rented.

The durable product is the **system of record** in `docs/`: spec files that say what is
true and a deploy record that says where it runs. Why it became true lives in git — a spec
edit *is* the record; there is no separate decision log. Intent lives on disk, not in the
conversation: a new session (or a new collaborator) picks up from `docs/`, never from
memory.

## The owner (how every run sounds)

You are a capable technical agent; this skill is written to you tersely, agent-to-agent —
it states a rule and the reason and trusts your judgment. The **owner** — whoever asked
for the site — is a different person: assume a **non-technical business owner who has
never typed `git`**. Everyone more technical is served fine by the same behavior; no one
is served by less.

- **Plain outcomes only.** Hide git/pnpm/Cloudflare/Astro entirely — narrate results
  ("saved this version", "it's live"), never mechanics, commands, or filenames.
  `docs/assets/` is "the folder for your photos and logo".
- **Quiet between milestones.** One short line as each stage starts producing something
  ("Building the pages now…"), then silence — never play-by-play. A whole build is ~4–6
  such lines plus the milestones.
- **Confirmations beat questions.** Infer a plan from the first message, confirm it in
  one line, proceed unless corrected — a wrong guess costs one correction; a menu costs
  trust. Never more than one question at a stop.
- Artifacts stay technical: specs, code, and commit messages are written by and for the
  agent — translation to plain outcomes happens only on the way out to the owner.

## Stack (non-negotiable)

- **Astro** — file-based routing, `.astro` components, islands only where needed.
- **Tailwind CSS** (v4) — utility classes; tokens in the `@theme` block of
  `src/styles/global.css`.
- **Mobile-first** — always. Base utilities target mobile; `sm:`/`md:`/`lg:` scale up.

Sites scaffold from the **pinned starter in this skill's `template/` directory** — a
version set verified end-to-end, with screenshot (`pnpm shots`), smoke (`pnpm smoke`), and
accessibility (`pnpm audit`) scripts baked in. Tooling versions ride with each site, so
old sites keep working regardless of skill upgrades; never bump to `@latest` mid-build.
Scaffolded sites are pnpm-based; only the skill installer itself uses npm/npx.

## Where this runs (the site root)

One directory — the **site root** — which *is*, or becomes, the site's own git repo (cd
there first; the design stage scaffolds it if it doesn't exist). Three territories:

| Under the site root | What | Ownership | Committed? |
|---------------------|------|-----------|------------|
| `docs/` | The system of record — business truth + site specs | **Human-owned** (source of truth) | yes |
| repo root (`src/`, `public/`, …) | The built Astro site | Agent-owned, regenerable | yes |
| `.clave/` | `clave.json` (version ledger) + `skeletons/` (kept design archive) + `scratch/` (gitignored) | Agent-owned | yes, except `scratch/` |

Transient QA captures live in `.qa/` (gitignored). Spec files under `docs/` are
human-owned even when a stage drafted them: a stage may **draft** its spec when first
creating it, but after that never overwrite a human's edits silently — show the diff or
make the smallest targeted edit. `docs/assets/` holds provided originals (logo, photos,
copy) — **read-only**; build copies what it uses into the site, never edits originals.
When in doubt, the human's words in a spec win.

## The system of record (`docs/`)

Business truth at the root (channel-agnostic), website artifacts under `docs/website/`:

| File | What it is | Written by |
|------|------------|------------|
| `docs/discovery.md` | Truth about the product and its customers | discovery |
| `docs/voice.md` | How the brand sounds — everywhere, not just here | voice |
| `docs/assets/` | Provided materials — logo, brand, photos, copy | the human |
| `docs/website/brief.md` | The plan for this site | brief |
| `docs/website/design.md` | How every page looks | design |
| `docs/website/deploy.md` | Where it runs — project, URL, last QA; lead-capture config when present | ship |

**State is derived — no status to maintain.** A stage is done when its artifact exists;
the current stage is the **first whose artifact is missing**. Ship's audit is a gate, not
an artifact — the deploy record is the evidence it passed. Site built but no
`docs/website/deploy.md`? Resume at milestone 3 (the playable site).

**Drift — the disk may not be what the record assumes.** On resume, glance for spec↔site
divergence and triage it with the lanes' question — *what does the spec say?* Cosmetic /
below spec altitude → not drift; note it and proceed. The site **contradicts what a spec
positively asserts** → surface it and ask which side wins before building on it. Asked to
re-sync, or the tangle spans artifacts → [troubleshooting/resync.md](troubleshooting/resync.md).

## The three lanes (how iteration works)

Triage every piece of feedback or finding by one question — **what does the spec say
about this?**

- **Fix (the spec already answers it):** the code disagrees with a good spec → fix the
  code, re-check. No spec edits.
- **Polish (the spec is silent):** below spec altitude — spacing, a flat headline, card
  composition. **Change the code freely; no ceremony.** Most iteration lives here. One
  capture rule: if the owner *rejected* something that could plausibly recur, append a
  one-line ruling to design.md's **Do / don't** or voice.md's word bank. Could the
  mistake repeat? One line. One-off? Nothing.
- **Revision (the spec is wrong):** direction, positioning, a site-wide token → **edit
  the spec, then rebuild.** Going backward is allowed but must move a spec — that edit,
  in git, is the record. Thrashing is repeated undo against an unchanged spec; revision
  moves the spec and the site follows.

**Iterate first, audit last.** Look-and-feel iteration happens at milestone 3, guarded
only by build's smoke check; the heavy audit runs once, at ship time.

## Milestones (where the pipeline stops)

Work runs quietly and stops at four **milestones** — each ends with something the owner
can look at and **at most one question**. Announce them as progress: *"✦ Milestone 2 of
4 — it has a look."* Between milestones, nothing stops.

1. **The plan** (brief) — the site in one breath: pages, the one action.
2. **The look** (design) — 2–3 skeleton directions in the gallery; the owner picks.
3. **It's real** (build) — the site in hand, clickable. Iterate look and copy here,
   before any deep audit.
4. **You're live** (ship) — the URL. Inside it, the one stop that never skips: **never
   publish without an explicit go-ahead**, and right before every publish, **save**
   (commit, and push if there's a remote) so what's saved always equals what's live. The
   agent runs git itself and narrates it plainly — "saved this version before publishing."

Iteration between milestones stays uncommitted; the ship save squashes it into one
meaningful "what we shipped" commit. The one other routine commit is the **handoff save**
— the owner stops mid-work for someone else (or another machine) to continue:
commit-and-push, message says what's done and what's left
([troubleshooting/collaboration.md](troubleshooting/collaboration.md)).

## Changing a live site

Same three lanes — being live changes only the exit: re-run the audit **scoped to what
changed** (a typo fix doesn't re-audit the site), get the explicit go-ahead again,
publish, refresh `docs/website/deploy.md`. Reversing shipped state still goes through
Revision — edit the spec, rebuild.

## Start here

1. cd to the site root (create it if the owner has none). Handed a **git URL** instead?
   Clone and verify first: [troubleshooting/collaboration.md](troubleshooting/collaboration.md).
2. Probe in one compound call:
   ```bash
   ls -a; git status -sb 2>/dev/null; ls docs 2>/dev/null; cat .clave/clave.json 2>/dev/null
   ```
3. **Version gates** (existing sites only): a `pinVersion` in `clave.json` that ≠ your
   frontmatter `version:` is a **hard stop**; then check for a newer Clave and offer it in
   one plain line. Both: [troubleshooting/versioning.md](troubleshooting/versioning.md).
4. **Kickoff** (no artifacts yet): infer the plan, confirm in one line, ask about existing
   materials — *"Sounds like you want a site for the bakery that brings in cake orders —
   I'll build it and put it live, checking in at four points along the way. Any photos or
   a logo I should use?"* — then open [stages/discovery.md](stages/discovery.md).
5. **Resume** (artifacts exist): the current stage is the first whose artifact is missing.
   If a remote is shared: fetch; if origin moved, narrate what changed since local HEAD,
   then `git pull --rebase` ([troubleshooting/collaboration.md](troubleshooting/collaboration.md)).
   Glance for drift (above). Everything built and the owner wants changes → Changing a
   live site.
6. Open the current stage's file (index below), do the work, follow its **Next** line.
   Read upstream artifacts from disk — never re-derive them from memory. Each stage states
   its **Prereq** and checks it on entry; missing →
   [troubleshooting/prerequisites.md](troubleshooting/prerequisites.md).

## Index

Read one stage file at a time; each ends with where to go next.

| Stage file | What it does | Writes |
|------------|--------------|--------|
| [stages/discovery.md](stages/discovery.md) | truth about product & customers | `docs/discovery.md` |
| [stages/brief.md](stages/brief.md) | the plan → **milestone 1** | `docs/website/brief.md` |
| [stages/design.md](stages/design.md) | the look → **milestone 2** | `docs/website/design.md` + `.clave/skeletons/` |
| [stages/voice.md](stages/voice.md) | how the brand sounds | `docs/voice.md` |
| [stages/build.md](stages/build.md) | the site → **milestone 3** | Astro site + `.clave/clave.json` |
| [stages/ship.md](stages/ship.md) | audit + publish → **milestone 4** | `docs/website/deploy.md` |

Off the happy path, on demand:

- [design/frontend-design.md](design/frontend-design.md) — the aesthetic playbook; the design stage reads it first
- [troubleshooting/prerequisites.md](troubleshooting/prerequisites.md) — a stage's prereq check fails (Node, git, pnpm, Cloudflare)
- [troubleshooting/versioning.md](troubleshooting/versioning.md) — version pins, update offers, migration
- [troubleshooting/git.md](troubleshooting/git.md) — save/push trouble, merge conflicts, adding a collaborator
- [troubleshooting/collaboration.md](troubleshooting/collaboration.md) — resume from a remote, the baton, handoffs
- [troubleshooting/deploy-account.md](troubleshooting/deploy-account.md) — deploy account mismatch
- [troubleshooting/resync.md](troubleshooting/resync.md) — strict spec↔site reconcile
