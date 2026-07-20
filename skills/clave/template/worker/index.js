// Lead-capture Worker. Serves static assets for everything except POST /api/lead,
// which this handler owns (see `run_worker_first` in wrangler.toml).
//
// Flow: honeypot → Turnstile server-side verify → email the owner. The email leg
// lives in email.js so the provider can be swapped without touching this file.
//
// Config comes from env (set in wrangler.toml [vars] or as secrets), so this file
// is site-agnostic and never edited per site:
//   LEAD_TO            — owner inbox submissions land in                (var)
//   LEAD_FROM          — From address, any address on the owner's domain (var)
//   LEAD_SUBJECT       — subject line for the notification              (var, optional)
//   LEAD_PAGE          — page the form lives on, for error redirects    (var, optional)
//   TURNSTILE_SECRET   — Turnstile secret key                           (secret)
// The honeypot field is named "lead_hp" (a non-autofill name; see LeadForm.astro).

import { sendEmail } from './email.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/lead' || request.method !== 'POST') {
      // Defensive: routing should only send POST /api/lead here, but fall through
      // to assets for anything else (e.g. a GET probe).
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
    }

    // Parse the body. A malformed/empty POST (bad Content-Type, no body) throws
    // here — treat it as a bad request, not an unhandled 500.
    let form;
    try {
      form = await request.formData();
    } catch {
      return reject(url, 'read', env);
    }

    // 1. Honeypot — a bot filled the hidden field. Accept silently, send nothing.
    //    (Looks identical to success so the bot gets no signal.) The field name is
    //    deliberately not a real autofill key, so browsers won't populate it and
    //    drop a genuine lead. Must match LeadForm.astro.
    if (form.get('lead_hp')) return redirect(url, '/thanks');

    // 2. Turnstile — verify the token server-side. Missing/failed → reject.
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, form.get('cf-turnstile-response'), request);
    if (!ok) return reject(url, 'verify', env);

    // 3. Email the owner. Reply-To is the visitor, so a reply answers the lead —
    //    but only when it's shaped like a bare address. It's untrusted input
    //    headed into an email header, and email.js is a swappable adapter, so
    //    never assume the provider rejects header-injection attempts. Anything
    //    else falls back to LEAD_TO (the raw value still appears in the body).
    const visitorEmail = (form.get('email') || '').toString().trim();
    const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail) ? visitorEmail : env.LEAD_TO;
    try {
      await sendEmail(env, {
        to: env.LEAD_TO,
        from: env.LEAD_FROM,
        replyTo,
        subject: env.LEAD_SUBJECT || 'New enquiry from your website',
        text: formatBody(form),
      });
    } catch (err) {
      return reject(url, 'send', env);
    }

    return redirect(url, '/thanks');
  },
};

async function verifyTurnstile(secret, token, request) {
  if (!secret || !token) return false;
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token.toString());
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// Build the email body from every submitted field except control fields.
// Bounded on purpose: a bot that beats Turnstile (solver farms exist) could
// otherwise post megabyte values or thousands of fields and turn the owner's
// notification into a weapon. Real enquiries never get near these limits;
// excess is truncated, not rejected — a too-chatty lead is still a lead.
const MAX_FIELDS = 20;
const MAX_LINE_CHARS = 4000;

function formatBody(form) {
  const skip = new Set(['lead_hp', 'cf-turnstile-response']);
  const lines = [];
  for (const [key, value] of form.entries()) {
    if (skip.has(key)) continue;
    if (lines.length === MAX_FIELDS) {
      lines.push('(further fields dropped)');
      break;
    }
    lines.push(`${key}: ${value}`.slice(0, MAX_LINE_CHARS));
  }
  return lines.join('\n') || '(empty submission)';
}

// Plain-POST friendly: redirect on success so a no-JS browser lands on /thanks.
function redirect(url, path) {
  return Response.redirect(new URL(path, url.origin).toString(), 303);
}

// On a recoverable error, redirect back with an error code; LeadForm.astro maps
// codes to copy client-side. Codes rather than text on purpose: the worker stays
// site-agnostic (copy belongs to the site, in the owner's voice), and a crafted
// link can't plant attacker-chosen text in the site's own error banner.
//
// Default target is the homepage's #contact section (the common case: a form in a
// homepage section). LEAD_PAGE overrides it for a standalone contact page (e.g.
// "/contact"), so a failed submit returns the visitor to the form — not the homepage,
// which would strand them and lose the error banner.
function reject(url, code, env) {
  const back = new URL(env?.LEAD_PAGE || '/', url.origin);
  back.searchParams.set('lead_error', code);
  if (!env?.LEAD_PAGE) back.hash = 'contact';
  return Response.redirect(back.toString(), 303);
}
