import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteStaticCopy } from 'vite-plugin-static-copy' // Імпортуємо плагін

// https://vite.dev/config/
export default defineConfig({
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: 'src/assets/*',
            dest: 'assets',
          },
          {
            src: 'src/content/*', 
            dest: 'content',
          },
          {
            src: 'src/menu/*',
            dest: 'menu',
          },
          {
            src: 'src/background/*',
            dest: 'background',
          }
        ],
      }),
    ],
    build : {
      outDir: 'dist/alpha',
    },
});
