# Troubleshooting: Saving & git

Off the happy path. Read this when **saving before a publish** hits a snag, or when the
owner is new to git and needs the idea explained. On the happy path the agent just commits
(and pushes, if there's a remote) right before each publish — the ship save in
[SKILL.md](../SKILL.md) — and narrates it as "saved", never in jargon. The owner never
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
git push          # only if there's a remote
```

Commit messages are for the owner to read later — plain outcomes ("Add contact form",
"New homepage hero"), not git-speak. One commit per deploy; iteration in between is not
committed.

## Setting up the remote (first push)

The build stage normally does this. If it didn't (the owner declined at build and changed
their mind, or it was skipped):

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
   the spec. **If no spec arbitrates** (both sides are Polish-lane — two valid tweaks to
   the same lines, the spec is silent), **do not pick** — surface both versions to the
   owner and let them choose. Last-writer-wins is the blind overwrite the baton exists to
   prevent.
3. `git add <file>` then `git commit` to finish the merge, and re-run the ship audit
   before any redeploy — a merge can break what each side individually passed.

If a conflict is beyond a quick reconcile, surface it to the owner with both versions
rather than guessing — losing someone's work silently is worse than pausing.

## Adding a collaborator (grant-access)

Bringing a second person onto the repo so they can push — what makes the baton possible.
It's **outward-facing**, so confirm before running it (like the deploy go-ahead): *"Add Sam
(github: samj) as a collaborator? They'll be able to push changes."*

- **With `gh`:** `gh api repos/{owner}/{repo}/collaborators/{username} -X PUT` sends the
  invite (same `gh`-first pattern as repo creation).
- **Without `gh`:** point the owner at the repo's **Settings → Collaborators → Add people**
  on GitHub.

Either way it's an **invitation the invitee must accept** (they get a notification) — it is
*not* instant access. Say so: *"I've invited Sam — once they accept, they can pick up the
site."* Don't imply they can push immediately.

## Deploy access vs. git access (they're separate)

Git push rights and Cloudflare deploy rights are **two different access systems**. A git
collaborator can do everything up to deploy, but `wrangler deploy` needs Cloudflare auth for
the owner's account, which a collaborator may not have. **Deploy secrets never travel in
git** (no tokens in the repo, ever). The public deploy *coordinates* do travel — they live
in committed `docs/website/deploy.md` (Platform / Project / URL), so a collaborator can see
*where* the site publishes and that a deploy is a **re-deploy**, even without the creds to
run it.

When a collaborator without Cloudflare access reaches ship: name where it would publish
(from the coordinates), then name the boundary — either the owner deploys, or grants
Cloudflare access on their side (out of Clave's reach; explain, don't attempt). The publish
leg can hand back to the owner via a handoff save in the other direction.
