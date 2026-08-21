import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function inlineCssPlugin(): Plugin {
  return {
    name: 'inline-css-plugin',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      let outputHtml = html;
      for (const [fileName, file] of Object.entries(ctx.bundle)) {
        if (fileName.endsWith('.css') && file.type === 'asset' && typeof file.source === 'string') {
          // Remove the <link rel="stylesheet" ...> tag for this CSS file
          const linkPattern = new RegExp(`<link[^>]*href="[^"]*${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g');
          outputHtml = outputHtml.replace(linkPattern, '');
          
          // Also catch generic relative paths /assets/...
          const baseName = path.basename(fileName);
          const baseLinkPattern = new RegExp(`<link[^>]*href="[^"]*${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g');
          outputHtml = outputHtml.replace(baseLinkPattern, '');

          // Inject as inline style tag right before </head>
          const inlineStyle = `<style id="inlined-app-styles">${file.source}</style>`;
          outputHtml = outputHtml.replace('</head>', `${inlineStyle}\n</head>`);
        }
      }
      return outputHtml;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), inlineCssPlugin()],
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
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      target: 'es2020',
      cssCodeSplit: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
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

