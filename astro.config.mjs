import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.voidix.net',
  output: 'static',
  server: {
    host: 'localhost',
    port: 4321,
    strictPort: true,
  },
  build: {
    format: 'directory',
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: false,
  vite: {
    build: { target: 'es2022' },
    server: {
      // When the browser reaches Astro through localhost:4321, keep the
      // injected Vite client on that same socket instead of falling back to
      // Vite's default 5173 port.
      hmr: { host: 'localhost', protocol: 'ws', clientPort: 4321 },
    },
  },
});
