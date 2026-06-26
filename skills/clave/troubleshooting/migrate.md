# Migrating a site built by an older Clave

Read this when kickoff finds **`claveVersion` (in `.clave/clave.json`) older than the
version running this session** (`SKILL.md` frontmatter `version:`). The site was last built
by an older Clave; this file is how the *running* skill walks it forward.

## The rule

- You read **your own** bundled copy of this file — **never the site's.** An old site
  predates the notes for migrating *off* itself, so the *from* comes from the site's
  `claveVersion` and the *path* comes from you, the newer skill.
- You migrate against the **version running this session** — the one in your context. If
  the driver accepted an update offer at kickoff, that newer version landed on disk for
  *next* session and is **not** what you migrate to now. Never migrate to a version you
  aren't running.
- Apply every entry below whose boundary you **cross**, in ascending order, from
  `claveVersion` up to the running version. A site on 1.2 going to 1.5 applies
  1.2→1.3, 1.3→1.4, 1.4→1.5 in sequence.
- After a clean migration, the build stage records the new version into `clave.json` the
  next time it builds (see `stages/build.md`) — `claveVersion` only advances when a run
  actually completes on the new version.

## Migrations

**No migrations yet — every version through the current release is backwards-compatible.**

When `claveVersion < installed` and there are no entries below to cross, there is nothing
to do: note it in one line (register-appropriate) and proceed. The *detection* exists now,
before any breaking change, so that sites built from this point on already know to look —
that's the whole reason this file ships present-but-empty.

## Adding the first entry

When a release introduces a change a site must be reconciled to, add an entry keyed by the
version boundary it crosses:

```md
### 1.4 → 1.5

What changed and why a site needs reconciling. Then the concrete steps the running skill
takes against an on-disk site that was built by 1.4 — file moves, spec rewrites, config
edits. Idempotent where possible; safe to re-run.
```

Keep entries **agent-executable**, not changelog prose — this is a sequence of actions a
newer Clave performs on an older site, not release notes for a human to read.
