import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://www.procurement-ai.de',
  output: 'static',
  server: { port: 5502 },
  integrations: [
    react(),
    tailwind(),
    sitemap(),
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
