// scripts/dev.js
import chalk from 'chalk'
import 'dotenv/config'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'vite'

// テンプレート処理関数をインポート
import { clearCache, renderTemplate } from '../src/lib/utils/templateProcessor.js'

// __dirnameの代わりに使用するための現在のファイルパスを取得
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const watchedEjsGlobs = ['src/pages/**/*.ejs', 'src/lib/components/**/*.ejs']

function toProjectPath(file) {
  const relativePath = path.isAbsolute(file) ? path.relative(projectRoot, file) : file
  return relativePath.split(path.sep).join('/')
}

function isWatchedEjs(file) {
  const projectPath = toProjectPath(file)
  return projectPath.endsWith('.ejs') && (projectPath.startsWith('src/pages/') || projectPath.startsWith('src/lib/components/'))
}

// 開発サーバーを起動する関数
async function startDevServer() {
  const server = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.js'),
    server: {
      // middlewareMode: trueの代わりにfalseを使用
      middlewareMode: false
    },
    plugins: [
      {
        name: 'ejs-template-handler',
        configureServer(server) {
          server.watcher.add(watchedEjsGlobs)

          const reloadEjs = (file) => {
            if (!isWatchedEjs(file)) return
            clearCache()
            server.ws.send({ type: 'full-reload' })
            console.log(chalk.gray(`[dev] reload: ${toProjectPath(file)}`))
          }

          server.watcher.on('add', reloadEjs)
          server.watcher.on('change', reloadEjs)
          server.watcher.on('unlink', reloadEjs)

          // カスタムミドルウェアを追加
          server.middlewares.use(async (req, res, next) => {
            const requestUrl = new URL(req.url || '/', 'http://localhost')
            const url = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname

            if (url.endsWith('.html')) {
              // .htmlリクエストを対応するEJSファイルにマッピング (サブディレクトリ対応)
              const relativePath = url.replace(/\.html$/, '').replace(/^\//, '')
              const ejsPath = path.resolve(__dirname, '../src/pages', `${relativePath}.ejs`)

              try {
                if (await fs.pathExists(ejsPath)) {
                  const html = await renderTemplate(ejsPath)
                  const transformedHtml = await server.transformIndexHtml(url, html)
                  res.setHeader('Content-Type', 'text/html')
                  return res.end(transformedHtml)
                }
              } catch (error) {
                console.error(chalk.red(`Error serving ${url}:`), error)
              }
            }

            next()
          })
        }
      }
    ]
  })

  // サーバーを起動
  await server.listen()

  server.printUrls()
  console.log(chalk.green('EJS templates are being served with hot reload!'))
}

// 開発サーバーを起動
startDevServer().catch((err) => {
  console.error(chalk.red('Error starting dev server:'), err)
  process.exit(1)
})
