/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Turnstile sitekey. Local/dev builds set the always-pass TEST key via
   *  .env.development; production leaves it unset, so LeadForm.astro falls back to the
   *  real sitekey baked in at ship. */
  readonly PUBLIC_TURNSTILE_SITEKEY?: string;
}
