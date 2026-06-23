import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Set to the production URL before deploy — canonical URLs, Open Graph URLs,
  // the sitemap, and robots.txt all derive from it. Until it's set, those are
  // skipped gracefully.
  // site: 'https://example.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
