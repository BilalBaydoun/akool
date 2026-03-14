// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://akool.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
});
