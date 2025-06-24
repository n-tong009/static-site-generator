// build/dev.js
import fs from 'fs-extra';
import path from 'path';
import { createServer } from 'vite';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// テンプレート処理関数をインポート
import { renderTemplate } from '../src/lib/templateProcessor.js';

// __dirnameの代わりに使用するための現在のファイルパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 開発サーバーを起動する関数
async function startDevServer() {
  const server = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.js'),
    server: {
      // middlewareMode: trueの代わりにfalseを使用
      middlewareMode: false,
    },
    plugins: [{
      name: 'ejs-template-handler',
      configureServer(server) {
        // カスタムミドルウェアを追加
        server.middlewares.use(async (req, res, next) => {
          const url = req.url === '/' ? '/index.html' : req.url;
          
          if (url.endsWith('.html')) {
            // .htmlリクエストを対応するEJSファイルにマッピング
            const pageName = path.basename(url, '.html');
            const ejsPath = path.resolve(__dirname, '../src/pages', `${pageName}.ejs`);
            
            try {
              if (await fs.pathExists(ejsPath)) {
                const html = await renderTemplate(ejsPath);
                res.setHeader('Content-Type', 'text/html');
                return res.end(html);
              }
            } catch (error) {
              console.error(chalk.red(`Error serving ${url}:`), error);
            }
          }
          
          next();
        });
      }
    }]
  });
  
  // サーバーを起動
  await server.listen();
  
  server.printUrls();
  console.log(chalk.green('EJS templates are being served with hot reload!'));
}

// 開発サーバーを起動
startDevServer().catch((err) => {
  console.error(chalk.red('Error starting dev server:'), err);
  process.exit(1);
});