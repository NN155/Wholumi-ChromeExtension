import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { vitePluginManifestDomainExpander } from './tools/vitePluginManifestDomainExpander.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/content/*',
          dest: 'content',
        },
        {
          src: 'src/background/*',
          dest: 'background',
        }
      ],
    }),
    vitePluginManifestDomainExpander({
      manifestPath: 'public/manifest.json',
      outputDir: 'dist/alpha',
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        menu: resolve(__dirname, 'src/menu/index.jsx'),
      },
      output: {
        entryFileNames: 'menu/[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        manualChunks: (id) => {
          // Don't split the content script into chunks
          if (id.includes('menu')) {
            return 'menu';
          }
        }
      },
    },
    outDir: 'dist/alpha',
  },
});
