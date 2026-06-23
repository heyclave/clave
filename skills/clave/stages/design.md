# Stage: Design

**Reads:** `docs/website/brief.md` (+ brand material in `docs/assets/`).
**Writes:** `docs/website/design.md` (the spec) + `.clave/skeletons/` (the kept explorations).

**Prereq:** **Node only** — the skeleton server is stdlib Node, run before any
`pnpm install`. This is the terminal stage for the *explore* [target](../SKILL.md#target),
so an explore run never needs pnpm, git, or Cloudflare at all.

The single source of truth for how every page looks. **Read
[`../design/frontend-design.md`](../design/frontend-design.md) first** — it ships with this
skill and is the aesthetic playbook for direction (distinctive choices, typography, avoiding
the generic-AI look). Then check `docs/assets/` — a provided logo or brand constrains colors
and type; work from it, never against it.

## Direction pick (checkpoint)

A "direction" is the 3–5 sentence aesthetic; everything else flows from it.

- [ ] Read [`../design/frontend-design.md`](../design/frontend-design.md) for the aesthetic
      playbook before proposing anything
- [ ] Propose **2–3 directions** before writing the spec, e.g.:
      ```
      A. Editorial serif — calm, whitespace, large serif headlines, ink-on-cream.
      B. Brutalist mono — stark, monospace, hard edges, high contrast.
      C. Warm playful — rounded, soft pastels, friendly sans, generous color.
      ```
- [ ] **Show them as skeletons** (below), not paragraphs
      → a page you can open is easier to judge than a paragraph; offer paragraphs-only
        only if the driver wants speed
- [ ] Driver picks — **checkpoint off → pick the best fit yourself**
- [ ] Write the choice into `Direction` in the spec

### Skeletons checklist (design explorations)

Standalone HTML files in the site root's `.clave/skeletons/` dir — no Astro, no build, no
framework server. **Kept, not thrown away** — a committed design archive to revisit later;
`design.md` stays the source of truth, skeletons are never authoritative.

- [ ] **Scaffold first** (if not already) — design runs before build, so get the template's
      skeleton tooling in place. Copy the starter into the site root, **without installing**:
      ```bash
      cp -R <path-to-this-skill>/template/. .
      mv gitignore .gitignore 2>/dev/null || true
      mkdir -p .clave/skeletons
      ```
      → only the stdlib `scripts/skeletons.mjs` + `.clave/skeletons/_boilerplate.html` are
        needed here; no `pnpm install` (an explore run never installs). Build re-runs this
        `cp` idempotently and *then* installs
- [ ] **Author** — per direction, copy `.clave/skeletons/_boilerplate.html` to a
      descriptively named file `.clave/skeletons/skeleton-<letter>-<two-or-three-word-vibe>.html`
      (e.g. `skeleton-a-playful-green-funk.html`)
      → the letter orders them, the words make the archive readable at a glance
- [ ] Fill each with a homepage (hero + a few sections), **real fonts/colors** for that
      direction, lorem ipsum + `[image]` boxes — it's a mood board, not a page
      → boilerplate pulls Tailwind (Play CDN) + Google Fonts via `<link>`; write utilities,
        no build step
- [ ] **Generate each independently — never by editing another**
      → editing yields three reskins of one layout (a palette picker, not a direction
        picker); vary the bones — hero, grid, section rhythm, density. Best as a fresh
        subagent per direction, blind to the others. **Cap at 3 per round.** Each file is
        fully self-contained (own `<head>`, fonts, `@theme`) — that isolation is what lets
        directions truly diverge
- [ ] **Serve** in the background (don't block) with bare `node` — stdlib-only, no package
      manager or `node_modules` needed:
      ```bash
      node scripts/skeletons.mjs   # serves .clave/skeletons/ on a free port, prints the URLs
      ```
- [ ] **Hand over** the root **gallery** URL (live thumbnails, click to open full size) +
      your own recommendation
      → read the port it printed (OS-assigned, never assume one); reason your rec from the
        direction specs
- [ ] **Don't kill the server until they've chosen.** Keep the skeleton files afterward —
      they stay committed in `.clave/skeletons/`, never copied into `docs/` or the built site

## Write the spec

- [ ] Validate body contrast ≥ 4.5:1 and a sane font pairing
- [ ] **Every value concrete and named** — `Primary #1B4332 (deep forest green) — headers
      and buttons`, not "a nice green"
      → vague adjectives let later pages improvise; that's the failure mode
- [ ] Write `docs/website/design.md` (template below)

```markdown
# Design — <Project Name>

## Direction
<3–5 sentences: vibe, the one memorable thing, and what to AVOID.>

## Colors
- Primary `#......` (<name>) — used for <where>
- Accent `#......` (<name>) — sparingly, for <where>
- Background `#......` (<name>)
- Surface/Card `#......` (<name>)
- Body text `#......` (<name>) — contrast vs background >= 4.5:1
- Border `#......` (<name>)

## Typography
- Display/Headings: <Font> — <weights>, for h1–h3
- Body: <Font> — 400/500, for paragraphs and UI
- Scale: <e.g. 16 / 18 / 24 / 32 / 48 px>

## Spacing & shape
- Spacing rhythm: <4 / 8px scale; section padding e.g. 64–96px>
- Corner radius: <e.g. 8px / sharp>
- Shadows: <e.g. subtle single soft shadow / none>

## Motion
- <e.g. 150–250ms ease-out on hover; one reveal on load; respect prefers-reduced-motion>

## Do / don't
<One-line rulings from polish feedback — append only when something was rejected AND
could recur on another page. Starts empty. e.g. "Don't center-align body text.">
```
