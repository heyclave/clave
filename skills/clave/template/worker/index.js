// Lead-capture Worker. Serves static assets for everything except POST /api/lead,
// which this handler owns (see `run_worker_first` in wrangler.toml).
//
// Flow: honeypot → Turnstile server-side verify → email the owner. The email leg
// lives in email.js so the provider can be swapped without touching this file.
//
// Config comes from env (set in wrangler.toml [vars] or as secrets), so this file
// is site-agnostic and never edited per site:
//   LEAD_TO            — owner inbox submissions land in              (var)
//   LEAD_FROM          — From address, on the verified sending domain (var)
//   LEAD_SUBJECT       — subject line for the notification            (var, optional)
//   TURNSTILE_SECRET   — Turnstile secret key                         (secret)
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
      return reject(url, 'Could not read your submission. Please try again.');
    }

    // 1. Honeypot — a bot filled the hidden field. Accept silently, send nothing.
    //    (Looks identical to success so the bot gets no signal.) The field name is
    //    deliberately not a real autofill key, so browsers won't populate it and
    //    drop a genuine lead. Must match LeadForm.astro.
    if (form.get('lead_hp')) return redirect(url, '/thanks');

    // 2. Turnstile — verify the token server-side. Missing/failed → reject.
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, form.get('cf-turnstile-response'), request);
    if (!ok) return reject(url, 'Could not verify you are human. Please try again.');

    // 3. Email the owner. Reply-To is the visitor, so a reply answers the lead.
    const visitorEmail = (form.get('email') || '').toString().trim();
    try {
      await sendEmail(env, {
        to: env.LEAD_TO,
        from: env.LEAD_FROM,
        replyTo: visitorEmail || env.LEAD_TO,
        subject: env.LEAD_SUBJECT || 'New enquiry from your website',
        text: formatBody(form),
      });
    } catch (err) {
      return reject(url, 'Something went wrong sending your message. Please try again.');
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
function formatBody(form) {
  const skip = new Set(['lead_hp', 'cf-turnstile-response']);
  const lines = [];
  for (const [key, value] of form.entries()) {
    if (skip.has(key)) continue;
    lines.push(`${key}: ${value}`);
  }
  return lines.join('\n') || '(empty submission)';
}

// Plain-POST friendly: redirect on success so a no-JS browser lands on /thanks.
function redirect(url, path) {
  return Response.redirect(new URL(path, url.origin).toString(), 303);
}

// On a recoverable error, redirect back with a message a no-JS page can show.
function reject(url, message) {
  const back = new URL('/', url.origin);
  back.searchParams.set('lead_error', message);
  back.hash = 'contact';
  return Response.redirect(back.toString(), 303);
}
