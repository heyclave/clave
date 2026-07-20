#!/usr/bin/env node
// Capture full-page screenshots of the built site to .qa/ — self-contained:
// boots `astro preview`, captures, shuts down. Run `pnpm build` first
// (the `shots` script does both).
//
// Usage: node scripts/shots.mjs [route ...]    defaults to "/"
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:net';

// Grab an OS-assigned free port so parallel Clave instances can't collide — and so we
// can never accidentally screenshot another instance's preview server on a shared port.
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
const VIEWPORTS = {
  mobile: { width: 375, height: 800 },
  desktop: { width: 1280, height: 900 },
};

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

try {
  const deadline = Date.now() + 30_000;
  for (;;) {
    try { await fetch(BASE); break; } catch {
      if (Date.now() > deadline) throw new Error(`preview server did not start on :${PORT}`);
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  mkdirSync('.qa', { recursive: true });
  const browser = await launchChromium();
  for (const route of routes) {
    const slug = route === '/' ? 'home' : route.replace(/\W+/g, '-').replace(/^-+|-+$/g, '');
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      const page = await browser.newPage({ viewport });
      // Block Turnstile: its script (challenges.cloudflare.com) holds a connection
      // open, so 'networkidle' never fires and navigation times out on any page with
      // a lead form. We use 'load' and don't screenshot the third-party widget anyway.
      await page.route('https://challenges.cloudflare.com/**', (r) => r.abort());
      await page.goto(BASE + route, { waitUntil: 'load' });
      // scroll through to trigger lazy/in-view reveals, then back to top
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 600) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 100));
        }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(300);
      const path = `.qa/${slug}-${name}.png`;
      await page.screenshot({ path, fullPage: true });
      console.log(path);
      await page.close();
    }
  }
  await browser.close();
} finally {
  stopServer();
}
