# Stage: Voice

**Reads:** `docs/website/brief.md`. **Writes:** `docs/voice.md`.

The single source of truth for how the brand **sounds and reads** (the parallel to
`design.md`). It lives at the `docs/` root, not under `docs/website/`, because voice is
channel-agnostic — ads and emails use it too — so what it produces must hold beyond the
site.

## Voice checklist

- [ ] Read the brief first — voice serves the job-to-be-done, not the reverse
- [ ] **Speak to the visitor's struggle and outcome, not your features**
- [ ] **Show, don't tell** — include a word bank (say this / not that) and ≥1 before/after
      → without examples a voice guide doesn't work
- [ ] Clear and concise — clarity beats cleverness; match reading level to the audience
- [ ] Write `docs/voice.md` (template below)

## Write `docs/voice.md`

```markdown
# Voice & Tone — <Project Name>

## Voice (constant)
<3–5 sentences: the personality of the writing — e.g. "Warm, direct, quietly confident.
Plain language, short sentences. Never hypey or jargon-heavy.">

## Tone (varies by context)
- Headlines: <e.g. bold, benefit-first, one idea>
- Body: <e.g. conversational, second-person "you">
- CTAs: <e.g. specific about what happens next — "Start free trial", not "Submit">
- Errors/empty states: <e.g. plain, reassuring, never blaming the user>

## Word bank
| Say this | Not that |
|----------|----------|
| <on-brand phrasing> | <off-brand phrasing to avoid> |

## Before / after
- ❌ <generic/feature-led line>
- ✅ <rewritten in this voice, outcome-led>
```
