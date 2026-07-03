# Troubleshooting: Collaboration (multi-player over git)

Off the happy path. Read this when a second person or machine enters: the owner hands you
a **git remote URL** to pick up, origin has moved since you last looked, or work needs to
pass to someone else mid-stream. Collaboration rides on a **shared git remote — no Clave
server**. What crosses between people is **a pushed commit and nothing more**; the
conversation never travels, so a resumer picks up purely from committed artifacts (specs,
site, `.clave/`), exactly as any resume does.

## Resume from a remote (clone-and-go)

1. **Clone** into a new directory and `cd` in:
   ```bash
   git clone <url> && cd <repo>
   ```
   Needs git (and auth if the repo is private) — see [prerequisites.md](prerequisites.md).
   If clone fails on auth, the person isn't a collaborator yet — the owner must invite
   them (grant-access, [git.md](git.md#adding-a-collaborator-grant-access)).
2. **Verify it's a Clave site** — the probe (`ls -a; ls docs; cat .clave/clave.json`)
   should show `docs/` and `.clave/clave.json`. Non-Clave or empty repo → **say so and
   stop**; don't scaffold over someone's unrelated code.
3. **Fall into the normal Start here** (SKILL.md) from the version gates onward — a pin
   travels with the repo, so it binds you too. You just cloned, so you're current:
   describe the site as-is, then continue at the first missing artifact.

## The baton — one writer at a time

No lock exists; it's a convention git keeps honest (a non-fast-forward push is rejected).
The normal sync is **`git pull --rebase`** — fetch before working, and if origin moved,
rebase onto it and narrate what changed (the review below). A rebase *conflict* means the
baton was broken (two people at once): resolve per
[git.md](git.md#merge-conflicts-the-collaboration-seam) — spec wins, and a spec-silent
conflict is **surfaced to the owner, never auto-resolved**. Clave warns only on *pushed*
movement; it **cannot** see someone editing live elsewhere — say so plainly rather than
imply otherwise.

## Hand off mid-work — the handoff save

The one routine commit besides the ship save: when the owner stops mid-work for someone
else (or another machine) to continue, commit-and-push the current tree to pass the
unfinished baton. No separate note — the **commit message** carries "what's done / what's
left", written in Clave's own technical terms (the resumer renders it into plain outcomes,
like any artifact). Iteration in between still stays uncommitted; the handoff is explicit,
not automatic.

## Review is a lens, not a gate

On any resume that follows someone else's work, diff since your local HEAD
(`HEAD..origin/main`, **before** rebasing) and **narrate what changed** in plain outcomes
— *"Since you left, Sam redesigned the hero and rewrote the pricing copy"* — before
proposing the next stage. Nothing is approved or blocked; the baton was the gate, the
review is the briefing.

## Access

Inviting a git collaborator (`gh`-first, confirmation required) lives in
[git.md](git.md#adding-a-collaborator-grant-access). Deploy **secrets never travel in
git**; the public deploy *coordinates* in `docs/website/deploy.md` do (so a resumer knows
the site is live and a deploy is a *re-deploy*), but a collaborator without Cloudflare
access hands the publish leg back —
[git.md](git.md#deploy-access-vs-git-access-theyre-separate).
