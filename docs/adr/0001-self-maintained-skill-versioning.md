# Self-maintained semver for the Clave skill, not the `skills` tool's content hash

## Context

The `skills` installer (vercel-labs/skills) versions skills by **content hash** — it
stores a GitHub tree SHA (`skillFolderHash`) in `skills-lock.json` and `skills check`
compares it against the live source. There is no semver, no tags, and no documented way to
pin or install a specific ref. A SHA can tell you a skill is *different*, but never
*older/newer*, *how far apart*, or *in what order* — and it's opaque to a human.

## Decision

Clave maintains its **own** version as a semver string in `SKILL.md` frontmatter
(`version:`), bumped by hand and git-tagged in this repo on each release. A site records
the version that built it in `.clave/clave.json` (`claveVersion`) and may declare an
optional `pinVersion`. The skill reads its *own* frontmatter to know what it is, and
compares against `clave.json` at kickoff. The tool's content-hash mechanism still runs
underneath for the freshness *check* (`skills check`); Clave's semver rides on top for all
*reasoning* — ordering, pins, and migration.

## Why

Three later capabilities all require an **ordered, human-meaningful** version, which a SHA
cannot provide:

- **Migration** — walking a site forward (1.3→1.4→1.5) needs ordered boundaries.
- **Pins** — "freeze at 1.4, stop if 1.5 is installed" needs to express *which* version.
- **Human/agent messaging** — "1.4 → 1.5 available" is actionable; a SHA delta is not.

## Consequences

- **Manual discipline:** every release must bump `version:` and add a git tag, or the whole
  scheme silently rots. This is the price paid for ordering.
- The `skills` tool exposes no ref-pinning, so honoring a `pinVersion` may require a
  `git checkout` of this repo at the tagged version rather than a tool flag. (Whether
  `skills update` can target a single skill by name is **unverified** — the README implies
  `update [skill-names...]`, the CLI reference shows only `update [options]`.)
- Three version-bearing values (`installed`, `claveVersion`, `pinVersion`) coexist on two
  axes (enforcement vs. migration) and are never compared to each other — see `CONTEXT.md`.
