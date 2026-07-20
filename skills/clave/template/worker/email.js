// Email adapter — the one place email delivery is provider-specific.
//
// Swap this file to change provider (Resend, a first-party API, …); the handler
// in index.js only calls `sendEmail(env, message)` and never touches the binding.
// `message` is { to, from, replyTo, subject, text }.
//
// This implementation uses the native Cloudflare Email Service `send_email`
// binding (env.EMAIL) — no API token, no runtime dependency. `from` is any address
// on a domain in the owner's Cloudflare account: no sending-domain onboarding, no
// SPF/DKIM — the anti-abuse gate is the verified recipient, not the sender. `to`
// must be a verified Destination Address on the account (see stages/ship.md).
export async function sendEmail(env, message) {
  return env.EMAIL.send(message);
}
