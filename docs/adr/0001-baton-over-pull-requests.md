# Collaboration uses a baton convention, not branches/PRs

Clave is multi-player over a shared git remote with **no Clave server**. Collaboration uses
a **baton** — one person works on `main` at a time, ends with an explicit handoff-save
(push), the next pulls (`git pull --rebase`) and continues — rather than the obvious
branch-per-person + pull-request model.

PRs were rejected for one reason: the skill's anchor user is a **non-technical owner** who
"never types git." A PR gate forces branches, review UI, and merge mechanics on someone who
can't operate them, and a true pre-merge gate needs a server or GitHub's PR layer as
load-bearing — both heavier than "rely on git exclusively." The baton serializes work so
there is normally nothing to merge; rebase keeps history linear; git's own non-fast-forward
rejection is the floor against blind overwrites.

Consequences worth remembering:

- **Presence is unknowable.** The baton is advisory — fetch sees only *pushed* work, never
  someone typing right now. We warn on pushed movement and say plainly we can't detect a
  live concurrent session. No "I'm working" marker (it would be a stale lock-file).
- **Conflicts surface, never auto-resolve.** When the baton is broken and a same-line,
  spec-silent conflict results, Clave asks the human — last-writer-wins is the exact blind
  overwrite the baton exists to prevent.
- **Review is a lens, not a gate.** Because work is already serialized, a resumer reviews
  by *narrating what changed* since local HEAD — there is no pre-merge approval step.
- If a future user genuinely needs a hard pre-merge gate, that's a deliberate sibling
  workflow (PR-based), not a reversal of this default.
