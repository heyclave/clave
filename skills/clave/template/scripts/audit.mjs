#!/usr/bin/env node
// Accessibility scan (axe-core via Playwright) of the built site — self-contained:
// boots `astro preview`, scans, shuts down. Exits non-zero on violations.
//
// Usage: node scripts/audit.mjs [route ...]    defaults to "/"
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';

// Grab an OS-assigned free port so parallel Clave instances can't collide — and so we
// can never accidentally audit another instance's preview server on a shared port.
const freePort = () =>
  new Promise((resolve, reject) => {
    const s = createServer();
    s.once('error', reject);
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
const PORT = await freePort();
const BASE = `http://localhost:${PORT}`;
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];

async function launchChromium() {
  // headless-shell: a UI-less Chromium build (~half the download of full chromium),
  // purpose-built for automated screenshots/DOM testing. Same engine, same render.
  const { chromium } = await import('playwright');
  const launch = () => chromium.launch({ channel: 'chromium-headless-shell' });
  try {
    return await launch();
  } catch {
    console.log('Chromium not provisioned yet — installing (first run only)...');
    const r = spawnSync('pnpm', ['exec', 'playwright', 'install', 'chromium-headless-shell'], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('playwright install chromium-headless-shell failed');
    return await launch();
  }
}

const server = spawn('pnpm', ['exec', 'astro', 'preview', '--port', String(PORT)], {
  stdio: 'ignore',
  detached: true,
});
const stopServer = () => {
  try { process.kill(-server.pid); } catch {}
};

let violations = 0;
try {
  const deadline = Date.now() + 30_000;
  for (;;) {
    try { await fetch(BASE); break; } catch {
      if (Date.now() > deadline) throw new Error(`preview server did not start on :${PORT}`);
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  const { AxeBuilder } = await import('@axe-core/playwright');
  const browser = await launchChromium();
  const context = await browser.newContext(); // axe requires context-created pages
  for (const route of routes) {
    const page = await context.newPage();
    // Block Turnstile: its script (challenges.cloudflare.com) holds a connection
    // open, so 'networkidle' never settles and navigation times out on form pages.
    // We use 'load'; the widget is a third-party iframe axe can't scan anyway.
    await page.route('https://challenges.cloudflare.com/**', (r) => r.abort());
    await page.goto(BASE + route, { waitUntil: 'load' });
    const results = await new AxeBuilder({ page }).analyze();
    for (const v of results.violations) {
      violations += 1;
      console.log(`[${v.impact}] ${route} — ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? '' : 's'})`);
      for (const node of v.nodes.slice(0, 3)) console.log(`    ${node.target.join(' ')}`);
    }
    await page.close();
  }
  await browser.close();
} finally {
  stopServer();
}

console.log(violations ? `${violations} accessibility violation(s)` : 'No accessibility violations.');
process.exit(violations ? 1 : 0);
