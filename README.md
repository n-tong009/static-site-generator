# static-site-generator

## 高速HTML生成環境 (EJS × Vite)

Astroのように構造化データ（Frontmatter）やJSコードを埋め込み、かつ通常のHTMLのように記述可能な高速なHTML生成環境です。

## ✨ 主な特徴

- 🚀 **高速な開発環境** - Viteによる高速なHMR（Hot Module Replacement）
- 📝 **EJSテンプレート** - 柔軟で強力なテンプレートエンジン
- 📊 **Frontmatter対応** - YAMLによる構造化データの埋め込み
- 🎨 **SCSS対応** - 最新のCSS機能とSassの機能
- 🏗️ **レイアウトシステム** - 再利用可能なレイアウトとパーシャル
- 🌙 **ダークモード** - システム設定対応の自動切り替え
- 📱 **レスポンシブ** - モバイルファーストデザイン
- 🔍 **SEO最適化** - OGP、Twitter Card、構造化データ対応
- 📈 **パフォーマンス監視** - Sentry統合によるエラートラッキング
- ⚡ **静的サイト生成** - 高速な本番用ビルド

## 🛠️ 使用技術

- **ビルドツール**: Vite 6.x
- **テンプレートエンジン**: EJS 3.x
- **スタイル**: Sass/SCSS
- **Frontmatter**: gray-matter
- **監視・エラートラッキング**: Sentry
- **ユーティリティ**: fs-extra, glob, chalk

## 📋 必要な環境

- Node.js 18.0.0 以上
- npm または yarn

## 🚀 クイックスタート

### インストール

```bash
# 依存関係をインストール
npm install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動（ポート3000）
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

### プロダクションビルド

```bash
# 本番用ビルドを実行
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 📁 プロジェクト構造

```
.
├── build/                    # ビルドスクリプト
│   ├── build.js             # プロダクションビルド
│   └── dev.js               # 開発サーバー
├── src/
│   ├── layouts/             # レイアウトテンプレート
│   │   └── DefaultLayout.ejs
│   ├── pages/               # ページテンプレート
│   │   ├── index.ejs        # トップページ
│   │   └── about.ejs        # アバウトページ
│   ├── partials/            # 共通コンポーネント
│   │   ├── Head.ejs         # <head>セクション
│   │   ├── Header.ejs       # ヘッダー
│   │   └── Footer.ejs       # フッター
│   ├── scripts/             # JavaScript
│   │   └── main.js          # メインスクリプト
│   ├── scss/                # スタイルシート
│   │   └── main.scss        # メインスタイル
│   └── lib/                 # ユーティリティ
│       ├── constants.js     # 設定定数
│       └── templateProcessor.js # テンプレート処理
├── public/                  # 静的ファイル
├── dist/                    # ビルド出力先
├── package.json
└── vite.config.js          # Vite設定
```

## 📄 新しいページの作成

### 1. ページファイルの作成

`src/pages/` ディレクトリに新しい `.ejs` ファイルを作成します：

```ejs
---
title: "新しいページのタイトル"
description: "ページの説明"
layout: "DefaultLayout"
---

<section>
  <h2>新しいページ</h2>
  <p>ここにコンテンツを記述します。</p>
</section>
```

### 2. Frontmatterの設定

各ページのメタデータはファイル先頭のYAMLフロントマターで設定：

```yaml
---
title: "ページタイトル"           # 必須
description: "ページの説明"       # 必須
layout: "DefaultLayout"         # 使用するレイアウト
noindex: false                  # SEO: インデックス制御
nofollow: false                 # SEO: フォロー制御
customHead: ""                  # カスタムhead要素
---
```

### 3. ナビゲーションへの追加

`src/partials/Header.ejs` と `src/partials/Footer.ejs` のナビゲーションに新しいページのリンクを追加してください。

## ⚙️ 設定のカスタマイズ

### サイト基本設定

`src/lib/constants.js` でサイト全体の設定を変更できます：

```javascript
export const SITE_CONFIG = {
  name: 'あなたのサイト名',
  title: 'サイトタイトル',
  description: 'サイトの説明',
  url: 'https://yourdomain.com',
  author: 'あなたの名前',
  locale: 'ja_JP',
  defaultLocale: 'ja',
};
```

### 環境別URL設定

```javascript
export const SITE_URL = {
  DEV: 'http://localhost:3000/',
  PROD: 'https://yourdomain.com/'
};
```

## 🎨 スタイルのカスタマイズ

### SCSS変数の変更

`src/scss/main.scss` でデザインをカスタマイズ：

```scss
// カラー設定
$primary-color: #3498db;
$secondary-color: #2ecc71;
$text-color: #333;
$background-color: #f9f9f9;
```

### ダークモード対応

ダークモードは自動的に対応済み。システム設定に応じて切り替わります。

## 📦 デプロイ

### 静的ホスティング（推奨）

```bash
# ビルド実行
npm run build

# dist/ フォルダの内容をアップロード
```

**対応プラットフォーム:**
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

### GitHub Actions（例）

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🔧 高度なカスタマイズ

### レイアウトの追加

1. `src/layouts/` に新しい `.ejs` ファイルを作成
2. ページのfrontmatterで `layout: "新しいレイアウト名"` を指定

### パーシャルの追加

1. `src/partials/` に新しい `.ejs` ファイルを作成
2. レイアウトやページで `<%- include('partials/新しいパーシャル.ejs') %>` でインクルード

### JavaScript機能の拡張

`src/scripts/main.js` にアプリケーションロジックを追加：

```javascript
// カスタム機能の追加例
class CustomFeature {
  constructor() {
    this.init();
  }
  
  init() {
    // 初期化処理
  }
}
```

## 📊 パフォーマンス

- **開発サーバー**: HMRによる瞬時更新
- **ビルド最適化**: CSS/JSの最小化、ハッシュ化
- **キャッシュ**: テンプレートキャッシュによる高速処理
- **監視**: Sentryによるパフォーマンス監視

## 🐛 トラブルシューティング

### よくある問題

**Q: 開発サーバーが起動しない**
```bash
# ポートが使用中の場合、別のポートを指定
npm run dev -- --port 3001
```

**Q: ビルドが失敗する**
```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

**Q: スタイルが反映されない**
- ブラウザのキャッシュをクリア
- 開発サーバーを再起動

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

- [Issues](https://github.com/n-tong009/static-site-generator/issues) - バグ報告や機能要望
- [Discussions](https://github.com/n-tong009/static-site-generator/discussions) - 質問や相談

---

**Made with ❤️ and modern web technologies**
