// src/lib/templateProcessor.js
import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import matter from 'gray-matter';
import chalk from 'chalk';

// 定数をインポート
import * as constants from './constants.js';
import { url } from './url.js';
import { glob } from 'glob';

/**
 * テンプレートとレイアウトのキャッシュ
 * @type {Map<string, {template: function, data: Object, layoutName: string}>}
 */
const templateCache = new Map();

/**
 * @type {Map<string, function>}
 */
const layoutCache = new Map();

/**
 * render() ヘルパー用 partial キャッシュ
 * @type {Map<string, function>}
 */
const partialCache = new Map();

/**
 * パフォーマンス監視のための処理時間記録
 * @type {Map<string, number>}
 */
const processingTimes = new Map();

/** @type {Object|null} */
let dataCache = null;

/**
 * src/data/**\/*.json を再帰的に読み込み、ファイル名をキーとしたオブジェクトを返す
 * src/data/faq.json → data.faq
 * src/data/sections/hero.json → data.sections.hero
 * @returns {Promise<Object>}
 */
async function loadData() {
  if (dataCache && process.env.NODE_ENV === 'production') return dataCache;

  const dataDir = path.resolve(process.cwd(), 'src/data');
  if (!await fs.pathExists(dataDir)) return {};

  const jsonFiles = await glob('src/data/**/*.json');
  const data = {};

  for (const file of jsonFiles) {
    try {
      const content = await fs.readJson(path.resolve(process.cwd(), file));
      const relative = path.relative(dataDir, path.resolve(process.cwd(), file));
      const keyPath = relative.replace(/\.json$/, '').split(path.sep);

      let obj = data;
      for (let i = 0; i < keyPath.length - 1; i++) {
        if (!obj[keyPath[i]]) obj[keyPath[i]] = {};
        obj = obj[keyPath[i]];
      }
      obj[keyPath[keyPath.length - 1]] = content;
    } catch (err) {
      console.error(chalk.red(`Failed to load data: ${file}`), err);
    }
  }

  dataCache = data;
  return data;
}

/**
 * render() ヘルパー本体。`render('Hero', { title: 'X' })` で `src/partials/Hero.ejs` 描画。
 * 同期動作 (EJS template 内呼出のため)。
 * @param {string} name - partial 名 (拡張子なし)
 * @param {Object} props - partial に渡すローカル変数
 * @param {Object} baseContext - 親 renderContext (frontMatter/data/locals/url 等継承)
 * @returns {string} レンダリング済 HTML
 */
function renderPartial(name, props, baseContext) {
  const partialPath = path.resolve(process.cwd(), 'src/partials', `${name}.ejs`);
  if (!partialCache.has(partialPath) || process.env.NODE_ENV !== 'production') {
    if (!fs.pathExistsSync(partialPath)) {
      throw new Error(`Partial not found: ${name} (${partialPath})`);
    }
    const content = fs.readFileSync(partialPath, 'utf-8');
    const compiled = ejs.compile(content, {
      filename: partialPath,
      cache: true,
      async: false,
      root: path.resolve(process.cwd(), 'src'),
      views: [
        path.resolve(process.cwd(), 'src'),
        path.resolve(process.cwd(), 'src/layouts'),
        path.resolve(process.cwd(), 'src/partials'),
      ],
    });
    partialCache.set(partialPath, compiled);
  }
  return partialCache.get(partialPath)({ ...baseContext, ...props });
}

/**
 * レイアウトを読み込む関数 * @param {string} layoutName - レイアウト名
 * @returns {Promise<function>} コンパイルされたEJSテンプレート関数
 */
async function loadLayout(layoutName) {
  const startTime = Date.now();
  
  try {
    const layoutPath = path.resolve(process.cwd(), 'src/layouts', `${layoutName}.ejs`);
    
    // キャッシュからレイアウトを取得するか、新しく読み込む
    if (!layoutCache.has(layoutPath) || process.env.NODE_ENV !== 'production') {
      console.log(chalk.blue(`Loading layout: ${layoutPath}`));
      
      const layoutContent = await fs.readFile(layoutPath, 'utf-8');
      
      // 同期的なEJSコンパイル設定（asyncをfalseに）
      const compiledLayout = ejs.compile(layoutContent, {
        filename: layoutPath,
        cache: true,
        async: false,
        root: path.resolve(process.cwd(), 'src'),
        views: [
          path.resolve(process.cwd(), 'src'),
          path.resolve(process.cwd(), 'src/layouts'),
          path.resolve(process.cwd(), 'src/partials')
        ]
      });
      
      layoutCache.set(layoutPath, compiledLayout);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration > 1000) {
      console.warn(`Layout loading took ${duration}ms for ${layoutName}`)
    }
    
    return layoutCache.get(layoutPath);
  } catch (error) {
    const enhancedError = new Error(`Failed to load layout: ${layoutName}`);
    enhancedError.originalError = error;
    enhancedError.layoutName = layoutName;
    
    console.error(chalk.red(`Error loading layout: ${layoutName}`), error);
    throw enhancedError;
  }
}

/**
 * 共通のテンプレート処理ロジックを提供するベース関数 * @param {string} filePath - テンプレートファイルのパス
 * @param {Object} [options={}] - オプション設定
 * @param {string} [options.outputDir] - 出力ディレクトリ
 * @param {boolean} [options.isDev] - 開発モードフラグ
 * @returns {Promise<{
 *   html: string,
 *   renderedContent: string,
 *   data: Object,
 *   pagePath: string,
 *   outputPath?: string
 * }>} 処理結果オブジェクト
 */
async function baseTemplateProcessor(filePath, options = {}) {
  const startTime = Date.now();
  const templateId = path.relative(process.cwd(), filePath);
  
  try {
    console.log(chalk.blue(`Processing template: ${filePath}`));
    
    // キャッシュからテンプレートを取得するか、新しく読み込む
    if (!templateCache.has(filePath) || process.env.NODE_ENV !== 'production') {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      if (!data.title) {
        console.warn(`Missing title in frontmatter for ${templateId}`)
      }
      if (!data.description) {
        console.warn(`Missing description in frontmatter for ${templateId}`)
      }
      
      // レイアウト名を取得（デフォルトはDefaultLayout）
      const layoutName = data.layout || 'DefaultLayout';
      
      // テンプレートをコンパイル（同期処理）
      const template = ejs.compile(content, {
        filename: filePath,
        cache: true,
        async: false,
        root: path.resolve(process.cwd(), 'src'),
        views: [
          path.resolve(process.cwd(), 'src'),
          path.resolve(process.cwd(), 'src/layouts'),
          path.resolve(process.cwd(), 'src/partials')
        ]
      });
      
      // キャッシュに保存
      templateCache.set(filePath, { template, data, layoutName });
    }
    
    const { template, data, layoutName } = templateCache.get(filePath);
    
    // ページ固有のデータを準備
    const pagePath = '/' + path.relative(path.resolve(process.cwd(), 'src/pages'), filePath)
      .replace('.ejs', '.html');
    
    // ローカル変数を準備
    const locals = {
      ...data,
      pagePath,
      customHead: data.customHead || ''
    };
    
    // src/data/ JSON を読込み
    const siteData = await loadData();

    // レンダリング用のコンテキストを作成
    const renderContext = {
      ...constants,
      frontMatter: data,
      pagePath,
      locals,
      data: siteData,
    };
    renderContext.url = (p) => url(p, pagePath);
    renderContext.render = (name, props = {}) => renderPartial(name, props, renderContext);

    // テンプレートをレンダリング（同期的に）
    const renderedContent = template(renderContext);

    // レイアウトを読み込み
    const layout = await loadLayout(layoutName);

    // レイアウトにテンプレートの内容を渡してレンダリング（同期的に）
    const layoutContext = {
      ...constants,
      content: renderedContent,
      frontMatter: data,
      pagePath,
      locals,
    };
    layoutContext.url = (p) => url(p, pagePath);
    layoutContext.render = (name, props = {}) => renderPartial(name, props, layoutContext);
    const html = layout(layoutContext);
    
    // 出力ファイルのパスを生成
    let outputPath;
    
    if (options.outputDir) {
      const relativePath = path.relative(path.resolve(process.cwd(), 'src/pages'), filePath);
      outputPath = path.join(options.outputDir, relativePath.replace('.ejs', '.html'));
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // パフォーマンス追跡
    processingTimes.set(templateId, duration);
    
    if (duration > 2000) {
      console.warn(`Template processing took ${duration}ms for ${templateId}`)
    }
    
    console.log(chalk.green(`✓ Processed ${templateId} in ${duration}ms`));
    
    return {
      html,
      renderedContent,
      data,
      pagePath,
      outputPath
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // エラー情報を拡張
    const enhancedError = new Error(`Template processing failed for ${templateId}`);
    enhancedError.originalError = error;
    enhancedError.filePath = filePath;
    enhancedError.templateId = templateId;
    enhancedError.processingTime = duration;
    enhancedError.options = options;
    
    console.error(chalk.red(`Error processing ${filePath}:`), error);
    throw enhancedError;
  }
}

/**
 * テンプレートを処理してHTMLファイルを生成する関数 * @param {string} filePath - テンプレートファイルのパス
 * @param {string} outputDir - 出力ディレクトリのパス
 * @returns {Promise<string>} 生成されたファイルのパス
 */
export async function processTemplate(filePath, outputDir) {
  try {
    const { html, outputPath } = await baseTemplateProcessor(filePath, { outputDir });
    
    if (!outputPath) {
      throw new Error('出力パスが指定されていません')
    }
    
    // ディレクトリが存在することを確認
    await fs.ensureDir(path.dirname(outputPath));
    
    // HTMLファイルを書き込む（UTF-8エンコーディングを明示）
    await fs.writeFile(outputPath, html, 'utf-8');
    console.log(chalk.green(`Generated: ${outputPath}`));
    
    return outputPath;
  } catch (error) {
    throw error
  }
}

/**
 * 開発サーバー用のテンプレート処理関数 * @param {string} filePath - テンプレートファイルのパス
 * @returns {Promise<string>} レンダリングされたHTML
 */
export async function renderTemplate(filePath) {
  try {
    const { html } = await baseTemplateProcessor(filePath);
    return html;
  } catch (error) {
    
    console.error(chalk.red(`Error rendering ${filePath}:`), error);
    
    // エラー時は詳細なエラーページを返す
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>テンプレートエラー</title>
  <style>
    body { 
      font-family: monospace; 
      background: #1a1a1a; 
      color: #ff6b6b; 
      padding: 2rem; 
      line-height: 1.6;
    }
    .error-container {
      max-width: 800px;
      margin: 0 auto;
      background: #2a2a2a;
      padding: 2rem;
      border-radius: 8px;
      border-left: 4px solid #ff6b6b;
    }
    .error-title { color: #fff; margin-top: 0; }
    .error-details { 
      background: #333; 
      padding: 1rem; 
      border-radius: 4px; 
      overflow-x: auto; 
    }
    .error-stack { 
      color: #ffd93d; 
      font-size: 0.9em; 
      white-space: pre-line; 
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1 class="error-title">🚫 テンプレート処理エラー</h1>
    <p><strong>ファイル:</strong> ${filePath}</p>
    <p><strong>エラーメッセージ:</strong></p>
    <div class="error-details">
      <div class="error-stack">${error instanceof Error ? error.message : String(error)}</div>
    </div>
    ${error.stack ? `
    <p><strong>スタックトレース:</strong></p>
    <div class="error-details">
      <div class="error-stack">${error.stack}</div>
    </div>
    ` : ''}
    <p><em>ファイルを修正して保存すると自動的にリロードされます。</em></p>
  </div>
</body>
</html>`;
  }
}

/**
 * パフォーマンス統計を取得する関数
 * @returns {Object} 処理時間の統計情報
 */
export function getPerformanceStats() {
  const times = Array.from(processingTimes.values());
  if (times.length === 0) return null;
  
  const stats = {
    totalTemplates: times.length,
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    maxTime: Math.max(...times),
    minTime: Math.min(...times),
    totalTime: times.reduce((a, b) => a + b, 0)
  };
  
  return stats;
}

/**
 * キャッシュをクリアする関数
 */
export function clearCache() {
  templateCache.clear();
  layoutCache.clear();
  partialCache.clear();
  processingTimes.clear();
  dataCache = null;
  console.log(chalk.yellow('Template and layout caches cleared'));
}

/**
 * エラーメッセージを強化する関数
 * @param {Error} error - エラーオブジェクト
 * @param {string} filePath - 処理中のファイルパス
 * @returns {string} 強化されたエラーメッセージ
 */
export function enhancedErrorMessage(error, filePath) {
  const errorInfo = {
    file: filePath,
    message: error.message,
    line: error.line || 'unknown',
    column: error.column || 'unknown',
    stack: error.stack?.split('\n').slice(0, 3).join('\n') || ''
  };
  
  return chalk.red(`
╔════════════════════════════════════════╗
║ EJS Template Error                     ║
╠════════════════════════════════════════╣
║ File: ${errorInfo.file}
║ Message: ${errorInfo.message}
║ Line: ${errorInfo.line}, Column: ${errorInfo.column}
╚════════════════════════════════════════╝
${errorInfo.stack}
  `);
}