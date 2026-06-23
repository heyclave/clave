# Stage: Brief

**Reads:** `docs/discovery.md`. **Writes:** `docs/website/brief.md`.

Turn discovery (truth about the product/customer) into a **plan for this website**: what
pages, what the site must accomplish, how it frames the value, and the primary action.
Discovery is the "what's true"; the brief is the "so here's what the site does."

## Brief checklist

- [ ] Read `docs/discovery.md` first; derive the site plan from it
      → don't re-research — discovery is the "what's true", the brief is "so here's what
        the site does"
- [ ] Tie the value proposition and CTA to discovery's job-to-be-done
- [ ] Keep it short — a handoff, not a document
- [ ] **Record the target** as the first line — `Target: deploy` (default), or e.g.
      `Target: build, no remote` (see SKILL.md "Target")
      → it's how a resumed session knows how far to go and which prereqs apply; absent
        means re-ask
- [ ] **Lead capture?** If the site collects enquiries, ask one question — *"Where should
      enquiries land?"* — and fill in the `## Lead capture` section. No capture → **omit
      the section entirely**
      → its absence is how build/qa/deploy know to skip capture
- [ ] Write `docs/website/brief.md` (template below)

## Write `docs/website/brief.md`

```markdown
# Brief — <Project Name>

Target: <deploy | build, no remote | design — how far this run goes; see SKILL.md>

## Site purpose
<One sentence: what this website is for, derived from the product's job-to-be-done.>

## Value proposition
<One punchy sentence: what you offer, why it matters, how you're different.>

## Primary CTA
<The single most important action — exact button copy, e.g. "Start your free 14-day trial".>

## Pages
<List the pages/sections needed and the goal of each.>

## Lead capture
<!-- Omit this whole section if the site collects no enquiries. -->
- **Captured:** <fields the form asks for, e.g. name, email, message — keep it minimal>
- **Lands at:** <owner email address submissions are sent to>
- **Thanks message:** <one line for the confirmation page, in the brand voice>

## Constraints / notes
<Brand, content, tone, must-haves, must-avoids. Omit if none.>
```
