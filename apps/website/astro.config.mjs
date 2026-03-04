import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://procurement-ai.de',
  output: 'static',
  trailingSlash: 'always',
  server: { port: 5502 },
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.includes('/impressum') &&
        !page.includes('/datenschutz') &&
        !page.includes('/agb') &&
        !page.includes('/404'),
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize: (item) => {
        // High priority for key landing pages
        if (item.url === 'https://procurement-ai.de/') {
          item.changefreq = 'daily';
          item.priority = 1.0;
        } else if (
          item.url.includes('/features/') ||
          item.url.includes('/preise/') ||
          item.url.includes('/cpv-klassifizierung/') ||
          item.url.includes('/kontakt/')
        ) {
          item.changefreq = 'weekly';
          item.priority = 0.9;
        } else if (item.url.includes('/blog/')) {
          item.changefreq = 'weekly';
          item.priority = 0.7;
        } else {
          item.priority = 0.6;
        }
        return item;
      },
    }),
    mdx(),
  ],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    ssr: {
      noExternal: ['framer-motion'],
    },
  },
});
