import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // 注意: このHTMLファイルは実際のページ生成には使用されません
        // Viteのビルドシステムを動作させるための技術的な要件です
        // 実際のHTMLページはsrc/pages/*.ejsから生成されます
        dummy: resolve(__dirname, 'src/index.html'),
      },
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  esbuild: (process.env.NODE_ENV === 'production' ) ? { drop: ['console', 'debugger'] } : {},
});