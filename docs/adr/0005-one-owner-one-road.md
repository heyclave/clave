# One owner, one road

## Context

Clave 0.1 accumulated generality faster than users. It carried three communication
registers (calling agent / technical human / non-technical owner), target dials (*stop
after design / build / deploy*, remote on/off, per-artifact approval), a pre-ship gate for
optional production add-ons, an analytics add-on with a provider taxonomy, and
sibling-provider prose on nearly every stage (deploy targets, git hosts, analytics
providers). Each piece was individually reasoned, but together they made the skill read
like a framework: SKILL.md ran to ~440 lines, most of it branching on users and roads
that don't exist yet. The audience that actually converts — and the one the prose was
already anchored on — is a **non-technical business owner** who wants a landing site live
and never wants to see the machinery.

A second, independent pressure: the pipeline was disclosed **all at once**. An agent read
the entire model (stages, checkpoints, dials, versioning, collaboration) before doing any
work, spending context on stages it might never reach and inviting it to rush the stage in
front of it.

## Decision

**Design for exactly one user, walking exactly one road, disclosed one stage at a time.**

- **One owner.** The skill assumes the least-technical owner and speaks one voice: plain
  outcomes, machinery hidden, always. Registers are removed — everyone more technical is
  served fine by the same behavior. The calling-agent special case (silent, no stops) is
  removed with them; another agent invoking Clave gets the same milestone stops a human
  does.
- **One road.** Target dials are removed. The road is discovery → brief → design → voice →
  build → ship; stopping early is just stopping (every stop is a prefix of ship, so the
  road extends losslessly). Per-artifact approval is removed. The always-on ship go-ahead
  survives — it is a correctness rule, not a dial.
- **Milestones replace checkpoints.** Four: *the plan*, *the look*, *it's real*, *you're
  live*. Each ends with something the owner can look at and at most one question, announced
  as progress ("Milestone 2 of 4"). Between milestones the agent works quietly — one plain
  line per stage. The milestones are the gamification; no badges, no ceremony beyond them.
- **One provider per role.** Cloudflare hosts, GitHub is the remote. Sibling-provider
  prose is deleted from the skill. Extensibility survives as a fact of the file layout
  (a stage file is just a file; a new target is a sibling file) — recorded as a maintainer
  convention in AGENTS.md, not sold in skill prose.
- **Analytics and the pre-ship gate are removed** (supersedes ADR 0003 and ADR 0004).
  Cloudflare's dashboard already answers "is anyone visiting?" for a site deployed under
  the owner's account, with zero repo changes; a beacon-level analytics ask can return as
  future work if owners actually ask for it. With analytics gone the gate has no member
  that lives in it — custom domain and lead-capture go-live already sit in ship — so the
  node is deleted rather than kept empty.
- **Breadcrumb disclosure.** SKILL.md shrinks to a manifest: identity and voice, the
  system of record and resume rule, the three lanes, milestones, and an index of every
  file. Stage mechanics live only in stage files, and each stage file ends by naming the
  next — the agent discovers the road by walking it. The invariants (lanes, file
  authority, voice) stay global because feedback and resumes arrive at any point; only the
  sequence is lazily disclosed.

**What deliberately survives:** the system of record in `docs/`, derived state,
why-history in git, the pinned template (including Playwright/axe — kept for now as the
agent's eyes), lead capture (brief-driven content, not a dial), skill versioning including
`pinVersion` (demoted to troubleshooting prose), and multi-player over git (mechanics
kept, demoted to troubleshooting; the model in CONTEXT.md still governs).

**Named non-goals** (previously open review questions, now closed): monorepo site
placement (one site = one repo root), i18n (single-locale), blog/docs/content collections
(it is a landing-page builder), alternative stacks or hosts.

## Considered options

- **Keep registers, just slim the prose** — rejected: the register table was the cheap
  part; the expensive part was every downstream passage re-branching on it (update offers,
  checkpoint bullets, gate behavior). One voice deletes the branches, not just the table.
- **Keep the pre-ship gate empty as a named address** — rejected: an empty node is prose
  debt; the membership rule can be re-derived from ADR 0004 if a production-only optional
  add-on ever returns.
- **Vendor-neutral deploy with Cloudflare as one sibling** (a prior review note) —
  rejected for the same reason registers were: generality for users we don't have. The
  seam (sibling stage files) remains; the prose does not.
- **Disclose everything up front (status quo)** — rejected: the index gives resume and
  triage everything they need at a fraction of the context, and hiding downstream stages
  keeps attention on the stage at hand.

## Consequences

- SKILL.md drops from ~440 lines to a ~120-line manifest; total skill prose roughly halves.
- ADR 0003 (analytics) and ADR 0004 (pre-ship gate) are superseded; the commented beacon
  leaves `template/src/layouts/Layout.astro`; `stages/preship.md` is deleted; `qa.md` and
  `deploy.md` merge into `stages/ship.md`.
- CONTEXT.md loses its register/heartbeat vocabulary and its Analytics and Pre-ship
  sections; "driver" leaves the ubiquitous language — it's **the owner** now.
- An agent-driven invocation loses its silent contract; if programmatic driving matters
  later it returns as its own deliberate mode, not a register.
- Version stays 0.1.0 — nothing has shipped broadly enough to migrate; stray `Target:`
  lines in existing briefs are simply ignored.
