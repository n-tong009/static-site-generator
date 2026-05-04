// build/build.js
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { build } from 'vite';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// テンプレート処理関数をインポート
import { processTemplate } from '../src/lib/templateProcessor.js';

// __dirnameの代わりに使用するための現在のファイルパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ビルドを実行する関数
async function runBuild() {
  console.log(chalk.bold('Starting production build...'));
  const startTime = Date.now();
  
  // 出力ディレクトリをクリーン
  const outputDir = path.resolve(__dirname, '../dist');
  await fs.emptyDir(outputDir);
  
  // Viteビルドを実行してアセットをバンドル
  console.log(chalk.cyan('Building assets with Vite...'));
  await build({
    configFile: path.resolve(__dirname, '../vite.config.js'),
  });
  
  // EJSテンプレートを処理
  console.log(chalk.cyan('Processing EJS templates...'));
  // glob.sync の代わりに非同期の glob 関数を使用
  const ejsFiles = await glob('src/pages/**/*.ejs');
  
  // 全テンプレートを並列処理
  await Promise.all(ejsFiles.map(file =>
    processTemplate(path.resolve(__dirname, '..', file), outputDir)
  ));

  // Prettier 整形(LP納品要件: 整形済み出力)
  console.log(chalk.cyan('Formatting dist with Prettier...'))
  const { format } = await import('prettier')
  const prettierConfig = JSON.parse(await fs.readFile(path.resolve(__dirname, '../.prettierrc.json'), 'utf-8'))
  const distFiles = await glob('dist/**/*.{html,css,js}')
  for (const file of distFiles) {
    const ext = path.extname(file).slice(1)
    const parser = ext === 'html' ? 'html' : ext === 'css' ? 'css' : 'babel'
    const content = await fs.readFile(file, 'utf-8')
    const formatted = await format(content, { parser, ...prettierConfig })
    await fs.writeFile(file, formatted, 'utf-8')
  }
  console.log(chalk.green(`✓ Formatted ${distFiles.length} files`))

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(chalk.bold.green(`Build completed in ${duration}s!`));
  console.log(chalk.bold(`Output directory: ${outputDir}`));
}

// ビルドを実行
runBuild().catch((err) => {
  console.error(chalk.red('Build failed:'), err);
  process.exit(1);
});