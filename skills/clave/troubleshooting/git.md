# Troubleshooting: Saving & git

Off the happy path. Read this when **saving before a deploy** hits a snag, or when the
owner is new to git and needs the idea explained. On the happy path the agent just commits
(and pushes, if there's a remote) right before each deploy — see the pre-deploy checkpoint
in [SKILL.md](../SKILL.md) — and narrates it as "saved", never in jargon. The owner never
types git; the agent runs it.

## Explaining "saved" to a non-technical owner

Keep it to the mental model, not the mechanics:

> "Saving makes a restore point — a snapshot of the whole site exactly as it is now. You
> can always come back to any past version. Each time we publish, I save first, so every
> version that ever went live is recoverable."

If they have a remote: *"…and I push that snapshot to your own repo — an off-site copy on
your account, so it survives this computer and you (or someone you trust) could pick the
site up on another machine."* That last part is the whole reason the remote exists; it's
also what makes collaboration possible later (everyone works from the same saved history).

Don't teach branches, staging, or rebasing. If they ask "where is it?" — their repo on
their account (GitHub by default), under their login. Owned, not rented.

## The save itself (what the agent runs)

```bash
git add -A
git commit -m "<plain summary of what's shipping, e.g. 'Launch site' / 'Update pricing copy'>"
git push          # only if the target has a remote
```

Commit messages are for the owner to read later — plain outcomes ("Add contact form",
"New homepage hero"), not git-speak. One commit per deploy; iteration in between is not
committed.

## Setting up the remote (first push)

The build stage normally does this. If it didn't (target gained a remote later, or it was
skipped):

- **With `gh`:** `gh repo create <name> --private --source=. --remote=origin --push`
  creates the repo on the owner's account and pushes in one step. Needs `gh auth status`
  to show them logged in — see [prerequisites.md](prerequisites.md).
- **Without `gh`:** the owner creates an empty **private** repo in the web UI (no README —
  it must be empty), then:
  ```bash
  git remote add origin <url>
  git branch -M main
  git push -u origin main
  ```

## Push rejected

- **`Authentication failed` / `could not read Username`:** the owner isn't authenticated.
  Easiest fix: install `gh` and run `gh auth login` (it configures git's credentials too).
  See [prerequisites.md](prerequisites.md#gh-github-cli). Avoid hand-managing tokens for a
  non-technical owner.
- **`Updates were rejected because the remote contains work you do not have`:** the remote
  has commits the local repo lacks — usually a README created with the repo, or a
  collaborator pushed. `git pull --rebase origin main`, resolve if anything conflicts (next
  section), then push again. If the remote was meant to be empty and isn't, the simplest
  recovery is to recreate it empty.
- **`src refspec main does not match`:** nothing has been committed yet — make the first
  commit (above), then push.

## Merge conflicts (the collaboration seam)

Solo on one machine, conflicts shouldn't happen. They appear once **two people (or two
machines) change the same file** — the case the remote exists to support. When a
`git pull` reports a conflict:

1. Git marks the clashing spots in the file with `<<<<<<<`, `=======`, `>>>>>>>`.
2. Open the file, keep the right content, delete the markers. For a `docs/` spec, the
   human's intent wins (file-authority rule, SKILL.md); for built code, reconcile against
   the spec.
3. `git add <file>` then `git commit` to finish the merge, and re-run QA before any
   redeploy — a merge can break what each side individually passed.

If a conflict is beyond a quick reconcile, surface it to the driver with both versions
rather than guessing — losing someone's work silently is worse than pausing.
