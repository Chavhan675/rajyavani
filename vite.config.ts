import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none',
      treeShaking: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      target: 'es2020',
      cssCodeSplit: true,
      minify: 'esbuild',
      modulePreload: {
        resolveDependencies(_filename, deps) {
          // Exclude heavy lazy dependencies from homepage modulepreload
          return deps.filter(dep => !dep.includes('firebase') && !dep.includes('charts') && !dep.includes('AdminPage'));
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('date-fns')) {
                return 'vendor-date';
              }
              if (id.includes('react-router') || id.includes('react-helmet')) {
                return 'vendor-router';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

