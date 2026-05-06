// scripts/build.js
import chalk from 'chalk'
import 'dotenv/config'
import fs from 'fs-extra'
import { glob } from 'glob'
import path from 'path'
import { fileURLToPath } from 'url'
import { build } from 'vite'

import { SITE_CONFIG, getCurrentEnv } from '../src/lib/utils/constants.js'
// テンプレート処理関数をインポート
import { processTemplate } from '../src/lib/utils/templateProcessor.js'

// __dirnameの代わりに使用するための現在のファイルパスを取得
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ビルドを実行する関数
async function runBuild() {
  console.log(chalk.bold('Starting production build...'))
  const startTime = Date.now()

  // 出力ディレクトリをクリーン
  const outputDir = path.resolve(__dirname, '../dist')
  await fs.emptyDir(outputDir)

  // Viteビルドを実行してアセットをバンドル
  console.log(chalk.cyan('Building assets with Vite...'))
  await build({
    configFile: path.resolve(__dirname, '../vite.config.js')
  })

  // EJSテンプレートを処理
  console.log(chalk.cyan('Processing EJS templates...'))
  // glob.sync の代わりに非同期の glob 関数を使用
  const ejsFiles = await glob('src/pages/**/*.ejs')

  // 全テンプレートを並列処理
  await Promise.all(ejsFiles.map((file) => processTemplate(path.resolve(__dirname, '..', file), outputDir)))

  // sitemap.xml 自動生成
  const sitemapEntries = ejsFiles
    .map((file) => {
      const relative = path.relative('src/pages', file).replace('.ejs', '.html')
      return `  <url><loc>${SITE_CONFIG.url}${relative}</loc></url>`
    })
    .join('\n')
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`
  await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap, 'utf-8')
  console.log(chalk.green('✓ Generated sitemap.xml'))

  // robots.txt 自動生成 (env別)
  const robotsContent = getCurrentEnv() === 'STG' ? `User-agent: *\nDisallow: /\n` : `User-agent: *\nAllow: /\nSitemap: ${SITE_CONFIG.url}sitemap.xml\n`
  await fs.writeFile(path.join(outputDir, 'robots.txt'), robotsContent, 'utf-8')
  console.log(chalk.green('✓ Generated robots.txt'))

  // Prettier 整形(LP納品要件: 整形済み出力)
  console.log(chalk.cyan('Formatting dist with Prettier...'))
  const { format, resolveConfig } = await import('prettier')
  const prettierConfig = await resolveConfig(path.resolve(__dirname, '..'))
  const distFiles = await glob('dist/**/*.{html,css,js}')
  for (const file of distFiles) {
    const ext = path.extname(file).slice(1)
    const parser = ext === 'html' ? 'html' : ext === 'css' ? 'css' : 'babel'
    const content = await fs.readFile(file, 'utf-8')
    const formatted = await format(content, { parser, ...prettierConfig })
    await fs.writeFile(file, formatted, 'utf-8')
  }
  console.log(chalk.green(`✓ Formatted ${distFiles.length} files`))

  // build manifest (verify-build.js で env一致検証に使用)
  const manifest = {
    buildEnv: getCurrentEnv(),
    buildTime: new Date().toISOString(),
    siteUrl: SITE_CONFIG.url
  }
  await fs.writeJson(path.join(outputDir, '.build-manifest.json'), manifest, { spaces: 2 })
  console.log(chalk.green('✓ Generated .build-manifest.json'))

  const endTime = Date.now()
  const duration = (endTime - startTime) / 1000

  console.log(chalk.bold.green(`Build completed in ${duration}s!`))
  console.log(chalk.bold(`Output directory: ${outputDir}`))
}

// ビルドを実行
runBuild().catch((err) => {
  console.error(chalk.red('Build failed:'), err)
  process.exit(1)
})
