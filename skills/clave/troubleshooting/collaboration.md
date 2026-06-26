# Troubleshooting: Resume from a remote (clone-and-go)

Off the happy path. Read this when the driver hands you a **git remote URL** instead of a
local site — a collaborator joining, or the owner on a second machine (the *resume-from-a-remote*
entry mode in [SKILL.md](../SKILL.md#start-here)). It is the only genuinely new step in
collaboration; everything after the clone is the **normal kickoff/resume path**.

## The sequence

1. **Clone** into a new directory and `cd` in:
   ```bash
   git clone <url> && cd <repo>
   ```
   Needs git (and auth if the repo is private) — see
   [prerequisites.md](prerequisites.md). If clone fails on auth, the driver isn't a
   collaborator yet — the owner must invite them (grant-access, [git.md](git.md#adding-a-collaborator-grant-access)).
2. **Verify it's a Clave site** — the probe (`ls -a; ls docs; cat .clave/clave.json`) should
   show `docs/` and `.clave/clave.json`. If it's a non-Clave or empty repo, **say so and
   stop** — don't scaffold over someone's unrelated code.
3. **Fall into the normal Start here** from the pin check onward: enforce the pin (it
   travels with the repo, so it binds you too), offer update, migrate, then derive the
   next-missing-artifact. You just cloned, so you're current — the review lens has nothing
   prior to diff against; describe the site as-is in the driver's register, then continue.

That's it. No separate resume logic — clone, confirm, and the existing path takes over.
