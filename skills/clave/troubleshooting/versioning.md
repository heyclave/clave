# Troubleshooting: Skill versioning (pins, updates, migration)

Read this at kickoff when `.clave/clave.json` exists (an existing site), or whenever a
version question comes up. The *template* is pinned per-site (its `package.json`); the
*skill* — these instructions — has its own version, and a site remembers which version
built it.

Three version-bearing values live on **two axes**; they are **never compared to each
other**, only ever each against the **installed** version. Three different numbers is a
legal, coherent state, not a paradox.

| Value | Where | Means | Compared to installed for |
|-------|-------|-------|---------------------------|
| **installed** | `SKILL.md` frontmatter `version:` (your own — read it) | the skill running *right now* | (the fixed point) |
| **`claveVersion`** | `.clave/clave.json` | the version that last **built this site** (past tense; moves *forward* only) | **migration** |
| **`pinVersion`** | `.clave/clave.json` (optional) | the version the owner **declared** they want | **enforcement** (hard stop) |

Clave's versions are **self-maintained semver**, git-tagged in the Clave repo — *not* the
`skills` tool's content hash, which can say "different" but never "older/newer" (the
ordering that migration and pins both need). The freshness *check* still rides on the
tool's hash; the *reasoning* rides on semver.

## At kickoff, in this order

1. **Enforce the pin (hard stop, before anything else).** `pinVersion` present and ≠ your
   installed version → **stop**, plain words: the site is pinned and the wrong version is
   installed. Fix the *install* — **never** move the site or downgrade the pin to match;
   the pin constrains the **tool, never the built site**. Recovery below.
2. **Offer an update (always prompt, never auto-apply).** Run the `npx skills` freshness
   check; if a newer Clave exists, offer it in one light line, easy to wave past — no
   version numbers, no commands: *"There's a newer version of the builder available —
   want it next time?"* On **yes**, `npx skills update`: it lands on disk and takes effect
   **next** session, not this one — say so plainly and let the owner choose to restart or
   keep going. This run continues on the version already in your context, so **do not
   advance `claveVersion`** for an update you merely downloaded.
3. **Migrate if older (against the *running* version).** If `claveVersion` < your
   installed version, read your **own** bundled [migrate.md](migrate.md) and walk the
   site forward — to the version running this session, never to a version you just
   offered and haven't loaded. (Today every version is backwards-compatible, so this is
   a no-op; the *detection* ships now so already-built sites know to look later.)

All three are no-ops on a brand-new site (no `clave.json` yet).

## The pin (power-user only)

Unlike everything else in Clave, the pin is **not** for a non-technical owner — it's a
deliberate power-user control, set by hand-editing `clave.json`; you read and enforce it
but never offer to set or clear it:

```json
{ "claveVersion": "0.1.0", "pinVersion": "0.1.0" }
```

Because it lives in the committed ledger, a pin is site-wide and binds every collaborator
— any resume hard-stops an install that ≠ the pin. That's intended: it lets the owner
guarantee all collaborators run one Clave version.

**When kickoff stops on a pin**, resolve by moving the **install** to the pin — not the
site, and not the pin:

- Re-install the skill at the pinned version, or `git checkout` the Clave repo at its
  matching tag (`vX.Y.Z`) and re-point the install there. (The `skills` tool versions by
  content hash, not ref, so a tagged checkout of the source is the reliable way to land
  an exact version.)
- Re-run — installed now equals the pin, and the stop clears.
- To **stop pinning** instead, delete the `pinVersion` line; the site floats to latest
  again (and the next update offer returns).

Never edit `claveVersion` by hand to dodge a stop — it records what built the site and is
maintained by the build stage; only `pinVersion` is the human's to set.
