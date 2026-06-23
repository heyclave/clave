# This is a Clave-managed website

This repo is built and maintained through the **Clave** skill. Before changing
the site, the specs, or anything in `docs/`:

1. Load the Clave skill and follow it. If it isn't installed:
   `npx skills add heyclave/clave --skill clave`
2. Read the system of record in `docs/` first — the specs are **human-owned** and the
   site follows them; never re-derive intent from memory or clobber spec wording.

If you proceed without the skill, the three rules that matter most:

- **Triage every change:** the spec answers it → fix the code to match; the spec is
  silent → polish the code freely; the spec is wrong → edit the spec, then rebuild (the
  spec edit, in git, is the record — there's no separate decision log).
- **Verify visually:** `pnpm shots` (screenshots to `.qa/`), `pnpm audit`
  (accessibility) — both self-contained. (This site runs on pnpm; if it's missing,
  `corepack enable pnpm` — it's pinned in `package.json` and corepack ships with Node.)
- **Never deploy without explicit human approval.**
