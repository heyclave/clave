# Stage: Deploy

**Reads:** the built site. **Writes:** `docs/website/deploy.md` (target, project, URL, QA
date, plus capture fields when lead capture exists). One target for now; add others as
`stages/deploy-<target>.md` siblings without touching upstream stages.

**Prereq:** the owner **authenticated to their own Cloudflare account** (`wrangler` itself
is already a site dependency — nothing to install). Deploy needs **no git**: `wrangler
deploy` uploads `./dist` directly. Check `wrangler whoami` on entry; if unauthenticated or
the account's wrong, see
[troubleshooting/prerequisites.md](../troubleshooting/prerequisites.md).

**Account pin (re-deploys):** if `wrangler.toml` already has `account_id` (set on the first
deploy), confirm the current login can reach it — otherwise deploying would silently stand up
a separate copy under the wrong account. The check is *"does `whoami` list the pinned
`account_id`?"*, not string-matching the email. Mismatch → **stop**, don't deploy:
[troubleshooting/deploy-account.md](../troubleshooting/deploy-account.md).

## Preconditions checklist (all required before deploying)

- [ ] **Driver has explicitly approved this deploy** — say what will ship (project, target,
      what changed) and wait for a yes
      → the one outward-facing, hard-to-reverse step; never automatic after QA
- [ ] **QA passed against the current build** — re-run it now if anything changed since the
      last run (including while waiting for approval) or you're unsure
      → QA leaves no artifact, so a fresh check can't be stale
- [ ] **Saved** — commit the current state, and push if the target has a remote:
      ```bash
      git add -A && git commit -m "<plain summary>"
      git push    # only if the target has a remote
      ```
      → every time, including each redeploy; the one routine commit (SKILL.md pre-deploy
        checkpoint) that keeps saved/pushed state equal to what's live. The agent runs it
        and narrates it as "saved", not in jargon. No remote / git not set up?
        [troubleshooting/git.md](../troubleshooting/git.md)
- [ ] `site` in `astro.config.mjs` set to the production URL (a custom domain, not the
      `*.workers.dev` URL, if one's going on) — SEO/sitemap/OG derive from it
- [ ] `pnpm build` succeeds locally

## Deploy (Cloudflare Workers static assets)

The template ships a `wrangler.toml` configured for **static assets** — `wrangler deploy`
uploads `./dist` to the edge. The Astro build stays fully static; there is no SSR adapter.
(Sites with lead capture also carry a tiny worker entry — see build.md — but the deploy
command is the same.)

```bash
pnpm deploy            # = astro build && wrangler deploy
```

Set `name` in `wrangler.toml` to the project name before the first deploy — it becomes the
`<name>.workers.dev` subdomain and the dashboard project. The owner is already
authenticated via `wrangler login`; if not, have them run it (`! wrangler login`).

Also **uncomment and fill `account_id`** in `wrangler.toml` from `wrangler whoami` (one
account → use it; several → ask the owner which, in plain terms), and commit it. This pins
the deploy to one account so a later collaborator on a different account can't fork the site
([troubleshooting/deploy-account.md](../troubleshooting/deploy-account.md)). It's a
coordinate, not a secret.

## Custom domain (strongly recommended)

A site can ship on `*.workers.dev` and add a domain later — but nudge toward a custom
domain regardless: it's the credibility, SEO, and (if lead capture is in play) the
**email-sending** prerequisite. Lead capture's `From` address must be on a domain in the
owner's Cloudflare account.

Two paths, depending on whether the owner already has a domain:

1. **No domain yet** → buy via **Cloudflare Registrar** (at-cost, lands directly in the
   account, no nameserver dance). Guided dashboard step: "Open the Registrar, search a
   name, buy it — it'll appear in your account in a minute."
2. **Domain registered elsewhere** → add the zone to the Cloudflare account, then the
   owner updates nameservers at their current registrar (a human step you can't do for
   them; propagation can take up to ~24h). Wait for the zone to go active before attaching.

Then **attach the domain to the Worker** and record the canonical URL:

```bash
# After the zone is active in the account:
pnpm exec wrangler deploy        # ensure the Worker exists
# Add a custom domain route (dashboard: Workers → the project → Domains & Routes → Add,
# or via wrangler if the zone is in the same account). The dashboard step is reliable
# during beta; prefer it if the CLI route errors.
```

Update `site` in `astro.config.mjs` to the custom domain and **redeploy** so canonical/OG
URLs and the sitemap point at it. Record the new canonical URL in `docs/website/deploy.md`.

## Lead-capture provisioning (one-time, only if the brief asks for capture)

Run this **once per site**, the first time a site with lead capture deploys. It's ~15 min,
mostly a guided dashboard session with the owner — honest "guided-manual" during the Email
Service beta; automate as the APIs stabilize. Requires a custom domain (above) first.

**Set expectations first with a non-technical owner.** Unlike a static site (which needs
none of this), capture is hands-on: it needs a Cloudflare account and ~15 min of clicking
through the dashboard *together* — onboarding a sending domain, verifying their own inbox,
creating a Turnstile widget, and (if the domain is registered elsewhere) a nameserver
change that can take up to ~24h. None of it can be automated away yet. Say this up front so
the owner knows it's a one-time setup session, not a quick deploy.

1. **Onboard the sending domain for Email Sending** (Cloudflare dashboard → Email →
   Email Sending). DNS records are auto-added since the zone is in the account.
2. **Verify the owner's destination address.** "Check your inbox and click the
   verification link I just triggered." The free plan only sends to verified destinations
   — this is the owner's own inbox, so one click.
3. **Create a Turnstile widget** (dashboard → Turnstile → Add). The owner pastes the
   **sitekey** (public, goes in the form) and the **secret** (server-side). Store the
   secret as a Worker secret:
   ```bash
   pnpm exec wrangler secret put TURNSTILE_SECRET
   ```
   Put the real **sitekey** in `LeadForm.astro` (replace the test-key default on the
   `sitekey` prop, or pass it where the form is used) — it's public, fine to commit.
4. **Deploy, then send a live test.** `pnpm deploy`, submit a real enquiry through the
   live form, and **the owner confirms it arrived** in their inbox. That confirmation is
   the QA gate for capture (see qa.md) — not a self-check.

The owner's notification address lives in `wrangler.toml` `[vars]` as `LEAD_TO` (committed
config, not a credential). If the owner would rather it not be in git, promote it to a
secret — `pnpm exec wrangler secret put LEAD_TO`, and drop it from `[vars]`.

If the Email Service onboarding UI has moved (it's in beta), follow the current dashboard
flow; the contract is unchanged: verified sending domain + verified destination + a stored
Turnstile secret.

## After deploy

Confirm the live URL loads and renders on mobile, then write `docs/website/deploy.md`
(overwrite each deploy):

```markdown
# Deploy

- Target: cloudflare-workers

## Canonical deployment
<!-- The one copy that owns `site`, the custom domain, and the SEO identity. -->
- Account ID: <account_id from wrangler.toml — the account this lives under>
- Project: <name from wrangler.toml>
- URL: <live url — custom domain if attached, else *.workers.dev>
- Last deployed: <YYYY-MM-DD>
- QA passed: <YYYY-MM-DD>

<!--
## Mirrors
Add a block per non-canonical copy under another account. A mirror's pages still
point their canonical/OG URLs at the canonical deployment above (it's a duplicate to
search engines) — second-class by construction. See troubleshooting/deploy-account.md.
- Account ID: <other account>
- Project: <name>
- URL: <*.workers.dev under that account>
- Last deployed: <YYYY-MM-DD>
-->

## Lead capture
<!-- Omit this whole section if the site has no capture form. -->
- Provider: cloudflare-email
- Notification address: <owner email submissions land in>
- Sending domain: <domain the From address uses>
- Turnstile sitekey: <public sitekey>
- Last verified: <YYYY-MM-DD a live test was confirmed received>
```

Changing a live site uses the same three lanes (SKILL.md); the only difference is the
exit — re-run QA scoped to what changed, get the go-ahead again, redeploy, refresh this
record.
