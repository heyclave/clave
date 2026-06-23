// Email adapter — the one place email delivery is provider-specific.
//
// Swap this file to change provider (Resend, a first-party API, …); the handler
// in index.js only calls `sendEmail(env, message)` and never touches the binding.
// `message` is { to, from, replyTo, subject, text }.
//
// This implementation uses the native Cloudflare Email Service `send_email`
// binding (env.EMAIL) — no API token, no runtime dependency. The `from` address
// must be on a domain verified for sending in the owner's Cloudflare account, and
// `to` must be a verified destination on the free plan (see stages/deploy.md).
export async function sendEmail(env, message) {
  return env.EMAIL.send(message);
}
