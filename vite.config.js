import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { ASSETS_URL } from './src/lib/constants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const _env = process.env.BUILD_ENV
const base = _env === 'production' ? ASSETS_URL.PROD || '/' : _env === 'staging' ? ASSETS_URL.STG || '/' : '/'

export default defineConfig({
  root: 'src',
  base,
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: false,
    cssMinify: false,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/scripts/main.js'),
      },
      output: {
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'assets/css/[name][extname]'
          return 'assets/[name][extname]'
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    watch: { ignored: ['**/node_modules/**', '**/dist/**'] },
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  esbuild: process.env.NODE_ENV === 'production' ? { drop: ['console', 'debugger'] } : {},
})
