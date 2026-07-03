# Troubleshooting: Drift & strict re-sync

Off the happy path. Read this when the owner asks to **re-sync** — or when resume-time
drift (see "Drift" in [SKILL.md](../SKILL.md)) is too tangled to triage in a line. The
happy path is tolerant: cosmetic nudges are noted and left, only a **material
contradiction** (the site contradicts what a spec positively asserts) stops and asks. This
file is the deliberate, full reconcile you run on demand — not something the pipeline
triggers on its own.

Drift goes **both directions**, and the fix is bidirectional. Neither side is automatically
right; the rule is *intent wins, then make the other side match it.*

- **Spec ahead of site** (someone edited `design.md`/`voice.md`/`brief.md`, the site was
  never rebuilt): the spec is the intent. Rebuild the affected pages/sections to match —
  this is the **Fix** lane (code disagrees with a good spec). No spec edit, no record.
- **Site ahead of spec** (someone hand-edited the markup; a past Polish-lane change drifted
  far enough to contradict the spec): decide whether the change was *intended*.
  - Intended and worth keeping → it's really a **Revision**: update the spec to describe
    the new reality (that spec edit, in git, is the record), then the spec and site agree
    again.
  - Unintended / a mistake → revert the markup to the spec. **Fix** lane.
- **Both edited, and they conflict** (two people, or a session that touched both): this is
  a merge-of-intent, not just of bytes. Surface both versions to the owner rather than
  guessing — losing intent silently is worse than pausing. Once decided, the winning
  intent lands in the **spec** first, then the site is brought to match it.

## How to run a strict re-sync

1. **Pull first** if there's a shared remote — drift you're about to reconcile may already
   be resolved (or worsened) by a collaborator's commits. Resolve any git conflict per
   [git.md](git.md#merge-conflicts-the-collaboration-seam) before reconciling intent.
2. **Walk the specs against the build, one artifact at a time** — `brief.md` (pages, CTA,
   value prop) → `design.md` (tokens, layout rules, do/don't) → `voice.md` (copy, word
   bank). For each, note every place the site and the spec disagree and label it
   spec-ahead, site-ahead, or both — using the triage above.
3. **Resolve toward intent, spec first.** Every kept change must end up *described in a
   spec*; the site is regenerated from specs, never the other way around. A reversal is
   just a spec edit like any other — the diff in git is the record (see the Revision lane
   in [SKILL.md](../SKILL.md)).
4. **Rebuild and re-run the ship audit** scoped to what changed — a reconcile can break what
   each side individually passed. Then the disk is trustworthy again and normal resumption
   (next-missing-artifact) holds.

## When to reach for strict mode vs. tolerate

Strict re-sync is **expensive** (it audits the whole record) — don't run it on every
resume. Reach for it when: the owner asks; drift is material and spans more than one
artifact; or a repo has been edited by several hands/sessions and you no longer trust the
derived state. A single cosmetic nudge never needs this — note it and move on.
