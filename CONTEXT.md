# Clave

The source for a distributable agent skill. The skill instructs a future agent to
build websites for users. The terms below are the project's language for **how that
agent communicates and collaborates while it works** — distinct from the
website-building domain itself.

## Communication

**Owner**:
The one user Clave is designed for: a **non-technical business owner** who has never typed
`git` and wants a landing site live. There is exactly one register — designing for the
floor serves everyone above it; no one is served by less. Whoever is steering a run
(a person, an operator acting for the owner, even another agent) is addressed the same
way. Replaces the 0.1-era *driver* + three-register model (see ADR 0005).
*Avoid*: driver, register, user (overloaded).

**Plain-at-the-boundary**:
The governing principle: **everything stored on disk speaks Clave's precise technical
language; the owner hears plain outcomes — translation happens only at the human boundary,
on the way out.** Source, specs, and commit messages — including the [[handoff-save]]
message — are written *by and for the agent*, in technical terms. The owner never reads
them raw; the agent renders artifacts into outcomes ("saved this version", "the site uses
your brand's navy"), never mechanics or filenames. This is what makes a handoff trivial:
nothing is written for a human directly, so there is nothing to translate *into* at write
time, only at read time.
*Avoid*: register baked into artifacts, per-reader commit messages.

**Milestone**:
Where the pipeline stops, and the whole progress UX. Four per build — *the plan*, *the
look*, *it's real*, *you're live* — each announced as progress ("✦ Milestone 2 of 4 — it
has a look"), each ending with **something the owner can look at and at most one
question**. Between milestones the agent works quietly: **one** short plain-outcome line
as a stage starts producing ("Building the pages now…"), then silence — a whole build is
~4–6 lines plus the milestones. The milestones *are* the gamification: no badges, no
ceremony beyond them (fanfare at milestones, calm between). The ship go-ahead — inside
milestone 4 — is the one stop that never skips.
*Avoid*: checkpoint (0.1-era dials), XP/badges, status updates.

**Play-by-play**:
The anti-pattern the milestone cadence exists to prevent: narrating each mechanical step
as it happens ("Now I'll set up the project, then configure Tailwind, then…"). Thinking
out loud in front of the owner. Distinct from the bounded per-stage line, which is
outcome-flavored and fires once.
*Avoid*: thinking out loud, narration, progress log.

## Collaboration

The skill is **multi-player over git, with no Clave server** — collaboration rides
entirely on a shared git remote. The unit that crosses between people/machines is a
**pushed git commit and nothing more**: the live conversation never travels, so a second
person picks up purely from committed artifacts, exactly as a fresh session resumes from
`docs/`. See [[handoff-save]], [[handoff-resume]].

**Note on prose budget:** the reasoning below is the *model* (it lives here, in
`CONTEXT.md`, and in the ADR). The **skill prose stays minimal** — collaboration mechanics
live in `troubleshooting/` (loaded on demand), reached from one index line in `SKILL.md`.
Match the skill's existing density; do not transplant these glossary explanations into the
skill.

**Handoff-save**:
A deliberate, owner-invoked commit-and-push of the **current working tree mid-pipeline**,
meaning *"I'm stopping here; someone else (or future-me on another machine) continues from
this state."* The **second** routine commit point alongside the existing ship save — but
distinct in meaning: the ship save records *what shipped*, the handoff save records *an
unfinished baton being passed*. Not automatic — iteration between milestones still stays
uncommitted (no ceremony); the handoff save is the explicit gesture that ends a working
session for someone else to resume. Without it, mid-way work lives only in the first
person's local tree and never reaches the remote. **No breadcrumb file** accompanies it:
the *commit message* carries any "what's done / what's left" signal — git already carries
it, and the skill already treats the diff + message as the record. The resumer
reconstructs state from `git log`, the diff, and the specs, never from a parallel note.
*Avoid*: WIP commit, auto-save (it is neither automatic nor every-iteration).

**Handoff-resume**:
The read-side counterpart to [[handoff-save]]: picking up a baton someone else (or
past-self on another machine) passed. Not a new code path — it *is* the skill's normal
resume (derive next-missing-artifact from `docs/`), with two collaboration behaviors
layered on at the top: the [[review]] lens (narrate what changed since local HEAD) and the
[[baton]]'s `pull --rebase`. Reached either by [[entry-mode]] *resume-from-remote*
(clone-and-go, never-seen-it) or by a local pull on an existing clone. The resumer trusts
only committed artifacts — never the absent conversation.
*Avoid*: takeover, claim.

**Baton**:
The collaboration discipline: **one person works at a time.** There is no Clave server and
therefore no real lock — the baton is a *social rule made safe by git*. The current holder
works on `main`, ends with a [[handoff-save]] (push), and the next person pulls and
continues. Because work is serialized, there is normally nothing to merge: the resumer is
strictly *behind* origin, so the normal pull — **`git pull --rebase`** — trivially replays
onto the holder's work and history stays linear. Clave's only enforcement is *legibility*:
before working it fetches, and if origin is ahead it pulls (rebase) and says so, rather than
letting anyone push over unseen work (git's own non-fast-forward rejection is the floor).
A `pull --rebase` that **hits a conflict is the signal the baton was broken** — two people
worked at once. The principle: **the baton prevents conflicts; it does not resolve them.**
When one happens, if a spec arbitrates (one side contradicts what a spec positively
asserts) the spec wins; but when **both sides are Polish-lane / spec-silent** — two valid
tweaks to the same lines, nothing in the spec to choose between them — Clave **surfaces
both and asks the human, never auto-resolves** (no last-writer-wins; silently dropping work
is the exact "blind overwrite" the baton exists to prevent). Prevention is the *legibility*
warning before work starts; the cure is *ask-never-guess*. No lock file, no
branch-per-person, no PR. **The warning is necessarily partial: it sees only *pushed*
movement** — the warning fires when origin moved since you last looked (someone handed off
or deployed), but **cannot** see a collaborator *actively typing right now*, because
in-progress work is deliberately never pushed (no WIP commits). Presence is **unknowable
without a server**, and Clave says so plainly rather than faking it with a stale "I'm
working" marker — honesty about the limit beats a lock-file that lies. The conflict
safety net (ask-never-guess) catches exactly the concurrent case the warning can't.
*Avoid*: lock, mutex, single-writer-lock (it is a convention, not an enforced lock).

**Entry mode** (start-from-scratch vs. resume-from-remote):
Clave has **two front doors**, both surfaced in `getting-started.md` (minimal) and
`SKILL.md` (mechanics). *Start from scratch* is the original path — no repo yet, run the
pipeline from discovery. *Resume from a remote* is the multi-player entry: the owner is
handed a **git remote URL** and Clave clones it, verifies it is a Clave site (`.clave/` +
`docs/` present — refuse a non-Clave or empty repo plainly), then drops into the **existing
kickoff/resume path** (enforce pin, offer update, migrate, derive next-missing-artifact).
The clone is the only genuinely new step; resume logic is reused, not forked. Because you
just cloned, you are current — the [[baton]]'s `pull --rebase` is implicit at entry. This is
how a collaborator who arrives cold (no Clave installed, only a URL) joins an existing site.
*Avoid*: import, init-from-remote.

**Grant-access**:
Bringing a second person onto the owner's repo so they can push — the entry that makes the
[[baton]] possible. Clave runs it via `gh` (add-collaborator API), web-UI fallback if `gh`
is absent — the same `gh`-first pattern the skill already uses to create the repo. Because
it is **outward-facing** (giving a human write access to someone's repo), it gets an
explicit confirmation first, like the ship go-ahead — never silent. Honest about GitHub's
shape: it sends an **invitation the invitee must accept** (they get a notification); it is
not instant access, and Clave says so rather than implying the collaborator can push
immediately.
*Avoid*: share, permission grant (reserve "grant-access" for this specific operation).

**Review (as a lens, not a gate)**:
How a resumer "checks changes someone made." Because the [[baton]] already serializes work,
a collaborator's commits are *already merged* by the time you pull-rebase — so review is
**not a pre-merge approval gate** (that would be the PR model the skill rejected as too
heavy). It is a **lens**: on every resume that follows someone else's work, Clave reads the
diff + `git log` **since the resumer last saw the site** and narrates *what changed* in
plain outcomes (*"Since you left, Sam redesigned the hero and rewrote the pricing copy"*) —
see [[plain-at-the-boundary]]. The owner reacts through the existing three lanes (fix /
polish / revision); nothing blocked, nothing approved. So "gated sync" is really
**narrated sync** — the baton was the gate, the review is the briefing. Concretely this
adds one behavior at the **top of resume**: diff-since-last-seen → summarize plainly,
before proposing the next stage. The **anchor** for "since you last saw it" is the **local
HEAD** before the pull: `git fetch`, then diff `HEAD..origin/main`, *then* `pull --rebase`.
Granularity is therefore **per-clone, not per-person** — git's own HEAD is the only memory,
no stored per-person state. A collaborator opening a *fresh* clone on a new machine is
treated as never-seen-it (like clone-and-go) and gets the whole site described, not a
since-last diff — a benign limit (more context than needed, never less), and the honest
price of "no server."
*Avoid*: approval, sign-off, gate (the review explicitly does *not* gate).

**Deploy coordinates travel; deploy secrets do not**:
The deploy boundary under multi-player. **Git-collaboration and deploy-rights are separate
access systems**: a git collaborator who can push is *not* automatically able to publish to
the owner's Cloudflare. Secrets — the `wrangler login` session, Turnstile keys — **never
travel in git** (a hard security line). But the **public coordinates do**, and already have
a committed home: `docs/website/deploy.md` (Target / Project / URL / QA date / **account
ID**), plus `wrangler.toml` `name` + `account_id` and `astro.config.mjs` `site`. The
**account ID is a coordinate, not a secret** — it names *which* Cloudflare account the site
lives under; you can't authenticate with it. Including it is what lets a resumer tell *whose*
account holds the site, not just that it's live. So a resumer can read *where the site lives,
under whose account, and that it's live* without holding the creds to push it. This yields the
**initial-vs-redeploy** distinction for free, derived not stored: `deploy.md` present ⟺
already deployed ⟹ a collaborator's deploy is a **re-deploy** to the recorded project; absent
⟹ first deploy. When a collaborator without Cloudflare access reaches ship, Clave names
*where* it would publish (from the coordinates) and then names the **credential boundary** —
the last leg may hand back to the owner (another [[handoff-save]] in the other direction),
or the owner grants Cloudflare access out-of-band (Clave explains, can't do it via `gh`).
[[grant-access]] is git-side only; deploy access is Cloudflare-side and outside Clave's reach.
See [[account-pinned-deploy]] for how the account ID guards against a silent fork.
*Avoid*: deploy token, creds-in-repo (the thing that explicitly must never happen).

**Account-pinned deploy**:
The guard that stops a [[deployment]] from silently forking across Cloudflare accounts.
`wrangler deploy` lands the Worker under **whatever account the logged-in session points
at**, and a Worker `name` is unique only *per-account* — so a collaborator authed to a
different account would silently stand up a **separate live copy** under their own account,
which no record points to. The fix: the **account ID is pinned in committed `wrangler.toml`
(`account_id`)** — the operative, deterministic signal (no account picker, no ambiguity under
a multi-account login) — and mirrored into `deploy.md` as the human-readable coordinate. The
check is *"does the current login (`wrangler whoami`) have access to the pinned `account_id`?"*
— **not** raw string-equality of `whoami` output, because one login can reach several
accounts. Match ⟹ a real re-deploy. **Mismatch ⟹ stop-and-disambiguate, never refuse and
never proceed silently** (the [[baton]]'s *ask-never-guess*, applied to the deploy leg): the
old copy is the owner's, and the account must never change without a human saying so. The
template ships `account_id` **blank/commented**; the **first deploy fills it** from `whoami`
(single account ⟹ automatic; multiple ⟹ Clave asks once, in plain terms). The recovery tree
lives in `troubleshooting/deploy-account.md`.
*Avoid*: comparing on email (an owner-granted collaborator has a different email, same
account ID — that case must pass), overwrite-on-mismatch (silently moves the record's account).

**Deployment** (canonical vs. mirror):
**One recorded live copy of the site** — an account ID + project name + URL + dates. Named
to avoid colliding with the deploy *platform* (`cloudflare-workers`). `deploy.md` records
**one or more** deployments, and they are **not symmetric**: exactly one is the
**canonical** deployment — it owns `astro.config.mjs` `site`, the custom domain, and the
SEO identity (canonical/OG tags and the sitemap are baked into `dist/` at build time,
pointing at *one* URL). Any other is an explicit **mirror**: a non-canonical copy under
another account whose pages' canonical and OG URLs still point at the **canonical
deployment's** URL (search engines see it as a duplicate). A mirror is second-class **by
construction**, not by policy — useful as a staging/preview copy, *not* a co-equal
production site, and Clave says so loudly when adding one. The original deployment is the
**default** canonical one. **Promotion** (mirror → canonical) is deliberate: rewrite
`site`, **rebuild** (so the baked-in canonical/OG/sitemap URLs move), redeploy, and swap
which deployment is marked canonical. Re-homing a site to a new account is therefore *not*
an overwrite — it is **add a deployment, then promote it**. Owners can **remove** a
deployment they no longer want recorded (it drops the record only — Clave can't tear down
a live Worker it has no access to, and says so). See [[account-pinned-deploy]].
*Avoid*: target (0.1-era overload), fork/orphan (a recorded mirror is neither — it is
legible), overwrite (re-home is additive, not a rewrite of the canonical entry).

## Skill versioning

Three version-bearing things live on two axes. They are **never compared to each
other** — each is compared only to the **installed version**. Three different numbers is
a legal, coherent state, not a paradox.

**Installed version**:
What the on-disk `SKILL.md` frontmatter (`version:`) says right now — the skill code about
to run. Governed by the `skills` tool / what's checked out, not by Clave. The fixed point
the other two are measured against. Clave's versions are **self-maintained semver**, bumped
by hand and git-tagged in this repo — *not* the `skills` tool's content hash, which can
only say "different", never "older/newer".

**claveVersion** (in `.clave/clave.json`):
The version that last successfully **built this site** — a fact about the site's history,
past tense. Only ever moves **forward**, and only when a run completes on a newer version.
Compared to installed to drive **migration** (`claveVersion < installed` → run the old→new
[[migration-notes]]). Advisory, never a constraint.
*Avoid*: pinned version, current version.

**pinVersion** (in `.clave/clave.json`, optional):
The version the owner **declared they want to run** — an intent, imperative. When present,
Clave **enforces** it against the installed version: `pinVersion ≠ installed` → **stop**,
and fix the *install* (reinstall/checkout the skill at the pin). The pin constrains the
**tool, never the built site** — the site never moves to satisfy a pin. Absent = float to
latest. Equal to [[claveVersion]] only at the instant it's set; they then diverge as the
site is rebuilt and the world moves. Because it lives in committed `.clave/clave.json`, a
pin is **site-wide and binds every collaborator** — it travels with the repo, so any
[[handoff-resume]] or [[entry-mode]] resume hard-stops a collaborator whose install ≠ the
pin. This is intended: it lets the owner guarantee all collaborators run one Clave version.
*Avoid*: lock (the `skills-lock.json` is a different, hash-based thing).

**Drift** (in the versioning sense):
Specifically `pinVersion ≠ installed` — the only genuine version *conflict*. Resolved by
moving the **install** back to the pin; the pin wins, and Clave never downgrades the pin to
match reality. Distinct from a `claveVersion`/installed gap, which is a migration to
*perform*, not a drift to *prevent*. (Note: Clave already uses "drift" for spec↔site
divergence in `SKILL.md`; this is the versioning-specific sense.)

**Migration-notes**:
The ordered, version-pairwise ledger of breaking changes (`troubleshooting/migrate.md`):
how to walk a site forward from one version boundary to the next (1.3→1.4, 1.4→1.5, …). The
installed skill reads its **own** bundled copy, **never the site's** — an old site predates
the notes for migrating *off* itself, so the *from* comes from the site's
[[claveVersion]] and the *path* comes from the newer skill. Applied step-by-step from
`claveVersion` up to [[installed-version]] when they differ. Ships **present but empty of
steps** until the first breaking release — the *detection* must exist before the first
breaking change so already-shipped sites know to look.
*Avoid*: changelog, release notes (those are human-facing; these are agent-executable).
