#!/usr/bin/env node
// Serve the design skeletons in .clave/skeletons/ over http:// so the driver can
// open and compare them in a browser. Stdlib only — no dependency, no download, no build.
// Astro is not involved; skeletons are plain self-contained HTML.
//
// Usage: node scripts/skeletons.mjs            -> serves ./.clave/skeletons on a free port
//        node scripts/skeletons.mjs 5000        -> force a specific port
// Stop with Ctrl-C. Lists the skeleton URLs (with the real port) on start.
//
// Port: defaults to an OS-assigned free port (0) so parallel Clave instances never
// collide. Read the printed URL — don't assume a fixed number.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2]) || 0;
const ROOT = '.clave/skeletons';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  // strip query, default to a directory listing at /
  let path = decodeURIComponent(req.url.split('?')[0]);
  if (path === '/') path = '/';
  // contain to ROOT — no path traversal out of .clave/skeletons/
  const rel = normalize(path).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, rel);

  try {
    if (path === '/') {
      // gallery of live iframe thumbnails — each skeleton rendered at desktop width and
      // CSS-scaled down, so the index stays in sync automatically (nothing to maintain).
      const entries = (await readdir(ROOT))
        .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
        .sort();
      const cards = entries
        .map(
          (f) => `<a class="card" href="/${f}" title="${f}">
            <div class="thumb"><iframe src="/${f}" scrolling="no" tabindex="-1" loading="lazy"></iframe></div>
            <span class="name">${f.replace(/\.html$/, '')}</span>
          </a>`,
        )
        .join('');
      const empty = `<p>No <code>skeleton-*.html</code> yet — write some into <code>.clave/skeletons/</code>.</p>`;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><meta charset=utf-8><title>skeletons</title>
<style>
  :root { color-scheme: light dark }
  body { font: 15px/1.4 system-ui, sans-serif; margin: 2rem; }
  h1 { font-size: 1.1rem; font-weight: 600; }
  .grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); }
  .card { display: block; text-decoration: none; color: inherit; }
  .thumb { position: relative; width: 100%; aspect-ratio: 1280/900; overflow: hidden;
           border: 1px solid #8884; border-radius: 8px; background: #fff; }
  /* render the iframe at full desktop size, then scale the whole thing down to fit */
  .thumb iframe { position: absolute; top: 0; left: 0; width: 1280px; height: 900px;
                  border: 0; transform: scale(calc(360 / 1280)); transform-origin: top left;
                  pointer-events: none; }
  .name { display: block; margin-top: .5rem; font-family: ui-monospace, monospace; font-size: .85rem; }
  .card:hover .thumb { outline: 2px solid #4a90d9; }
</style>
<h1>Design skeletons — click to open full size</h1>
${entries.length ? `<div class="grid">${cards}</div>` : empty}`);
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});

server.listen(PORT, async () => {
  const base = `http://localhost:${server.address().port}`;  // real port (0 → OS-assigned)
  let files = [];
  try {
    files = (await readdir(ROOT)).filter((f) => f.endsWith('.html') && !f.startsWith('_'));
  } catch {}
  console.log(`Skeletons on ${base}  (Ctrl-C to stop)`);
  for (const f of files) console.log(`  ${base}/${f}`);
  if (!files.length) console.log('  (no skeleton-*.html yet — write some into .clave/skeletons/)');
});
