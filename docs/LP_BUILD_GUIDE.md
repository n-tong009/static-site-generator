# LP Build Guide

EJS×Vite LP納品テンプレートの制作手順書。

---

## 1. プロジェクト概要・LP納品要件

| 要件               | 設定                             |
| ------------------ | -------------------------------- |
| JS/CSS/HTML 圧縮   | 禁止 (`minify: false`)           |
| ファイル名ハッシュ | 禁止 (`[name].js` 固定)          |
| 整形               | Prettier 整形済みで出力          |
| ディレクトリ       | `dist/` 構造 = `src/pages/` 構造 |

---

## 2. 開発フロー

```bash
pnpm install          # 初回のみ
pnpm dev          # http://localhost:3000 で確認
```

EJS ファイル編集 → ブラウザ即時反映 (Vite HMR)。

---

## 3. ビルドフロー

| コマンド          | BUILD_ENV  | 動作                                              |
| ----------------- | ---------- | ------------------------------------------------- |
| `pnpm build`      | production | 本番ビルド                                        |
| `pnpm build:prod` | production | 本番ビルド (上と同じ)                             |
| `pnpm build:stg`  | staging    | ステージングビルド (noindex 有効・Analytics 無効) |
| `pnpm preview`    | —          | `dist/` をローカルプレビュー                      |

---

## 4. ファイル構成

```
src/
  layouts/    HTML骨格 (<html>〜</html>)
  pages/      ページ本体 (frontmatter + コンテンツ)
  partials/   再利用部品 (Header, Footer, Analytics, ContactForm 等)
  lib/        定数・テンプレプロセッサ
  scripts/    クライアントJS
  scss/       Sass
  data/       JSON データファイル (EJS から data.xxx で参照)
public/       静的ファイル (dist/ にそのままコピー)
dist/         ビルド出力 (納品物)
```

---

## 5. ページ追加手順

`src/pages/new-page.ejs` を作成。frontmatter 必須:

```yaml
---
title: 'ページタイトル'
description: 'metaディスクリプション'
layout: 'DefaultLayout'
---
```

サブディレクトリ対応:

```
src/pages/
  lp/campaign.ejs  →  dist/lp/campaign.html
  products/detail.ejs  →  dist/products/detail.html
```

ビルドで自動的にディレクトリ階層を保持して出力。

---

## 6. データ管理 (src/data/)

`src/data/*.json` を作成すると EJS から `data.ファイル名` で参照可能。

```
src/data/faq.json     →  data.faq
src/data/site.json    →  data.site
src/data/sections/hero.json  →  data.sections.hero  (サブディレクトリ対応)
```

EJS 内参照例:

```ejs
<!-- 単一値 -->
<p><%= data.site.companyName %></p>

<!-- 配列ループ -->
<% data.faq.items.forEach((item) => { %>
  <dt><%= item.q %></dt>
  <dd><%= item.a %></dd>
<% }) %>
```

スプレッドシートからのデータ連携フロー:

```
スプレッドシート → JSON 書き出し → src/data/xxx.json に配置 → pnpm build
```

---

## 7. Analytics 設定

プロジェクトルートの `.env` ファイルで ID を設定:

```bash
# .env.example をコピーして作成
cp .env.example .env
```

```
# .env
ANALYTICS_GTM_ID=GTM-XXXXXXX   # GTM ID を差替
ANALYTICS_GA_ID=                # GTM 未使用時のみ GA4 ID を記入
```

- GTM と GA4 の両方を記入した場合は **GTM が優先** される
- `pnpm build:stg` では Analytics は出力されない (STG 環境保護)
- `.env` は `.gitignore` で除外済み → リポジトリに機密を commit しない

**Consent Mode v2**: `Analytics.ejs` は GTM 初期化前に Consent Mode default deny を自動出力。Cookie 同意 UI を実装する際は `gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted' })` を同意ボタンのコールバックで実行すること。

---

## 8. ContactForm カスタマイズ

### 基本設定 (.env)

フォーム送信先は `.env` で管理:

```
# .env
FORM_ENDPOINT_DEV=https://formspree.io/f/dev-id
FORM_ENDPOINT_STG=https://formspree.io/f/stg-id
FORM_ENDPOINT_PROD=https://formspree.io/f/prod-id
```

`constants.js` の `FORM_CONFIG` は自動で `process.env` から読み込む。その他設定:

```js
export const FORM_CONFIG = {
  endpoint: {
    /* .env 経由で自動設定 */
  },
  method: 'POST',
  mode: 'submit', // 'submit': 通常POST遷移 / 'fetch': 非同期POST
  thanksUrl: '/thanks.html',
  successMessage: '送信完了。担当者より連絡。',
  errorMessage: '送信失敗。時間をおいて再度お試し。'
}
```

**endpoint は `FORM_CONFIG.endpoint[env]` 経由で env 別に自動切替。** frontmatter や include 引数での endpoint override は無効(event故防止)。

### ページ単位でフォーム設定を上書き (frontmatter)

endpoint 以外のフィールド(mode/method/thanksUrl 等)は frontmatter から上書き可:

```yaml
---
title: 'LP-A お問い合わせ'
form:
  mode: 'fetch'
---
```

### 同一ページ内で複数フォーム (include 引数)

```ejs
<!-- フォームA (fetchモード) -->
<%- include('../partials/ContactForm.ejs', { form: { mode: 'fetch' } }) %>

<!-- フォームB (submitモード) -->
<%- include('../partials/ContactForm.ejs', { form: { mode: 'submit', thanksUrl: '/thanks-b.html' } }) %>
```

優先順位: include引数 > frontmatter > constants.js default (endpoint を除く)

---

## 9. 環境別ビルド

| 環境 | コマンド          | Analytics       | noindex |
| ---- | ----------------- | --------------- | ------- |
| 開発 | `pnpm dev`        | 無効            | 無効    |
| STG  | `pnpm build:stg`  | 無効            | 有効    |
| PROD | `pnpm build:prod` | 有効 (ID設定時) | 無効    |

各環境の URL は `src/lib/constants.js` の `SITE_URL` で管理:

```js
export const SITE_URL = {
  DEV: 'http://localhost:3000/',
  STG: 'https://stg.example.com/', // ← 案件毎に差替
  PROD: 'https://example.com/' // ← 案件毎に差替
}
```

---

## 10. URL/パス生成モード

HTML 内手書き `<a href>` の生成形式を `src/lib/constants.js` の `LINK_MODE` で 3 種から選択:

```js
export const LINK_MODE = 'relative' // 'absolute' | 'root' | 'relative'
```

| モード               | 出力例 (`/about.html` 指定時)    | 適用シーン                          |
| -------------------- | -------------------------------- | ----------------------------------- |
| `relative` (default) | `./about.html` / `../about.html` | サブディレクトリ配置・案件移植容易  |
| `root`               | `/about.html`                    | サイトルート直下配置 (Phase 3 互換) |
| `absolute`           | `https://example.com/about.html` | 複数ドメイン横断・SEO堅牢化         |

EJS テンプレート内で `url()` ヘルパー経由でリンク生成:

```ejs
<a href="<%= url('/about.html') %>">About</a>
<a href="<%= url('/lp/campaign-a.html') %>">Campaign</a>
<img src="<%= url('/images/hero.jpg') %>" alt="">
```

**自動処理** (記述側 意識不要):

- 外部URL (`https://...`)・`mailto:`・`tel:`・anchor (`#`) は無加工で返却
- `og:url` / `canonical` は LINK_MODE 影響受けず常に絶対URL (`SITE_URL` ベース)

**注意**:

- `url()` 入力は **ルート相対** (`/` 始まり) 前提
- Vite ビルドの `<script>` `<link>` `<img>` は `LINK_MODE` 不適用 (Vite `base` で別制御 → 13章)

---

## 11. CDN対応

ビルド成果物 (CSS/JS/画像) を CDN URL から配信したい場合、`src/lib/constants.js` の `ASSETS_URL` を設定:

```js
export const ASSETS_URL = {
  DEV: '/',
  STG: '', // 例: 'https://stg-cdn.example.com/'
  PROD: 'https://cdn.example.com/' // 案件毎に差替
}
```

`vite.config.js` が `BUILD_ENV` に従って `base` を自動切替 → ビルド出力 HTML のアセットURL書換:

```html
<!-- ASSETS_URL.PROD='' (CDN不使用) -->
<script type="module" src="/assets/js/main.js"></script>

<!-- ASSETS_URL.PROD='https://cdn.example.com/' -->
<script type="module" src="https://cdn.example.com/assets/js/main.js"></script>
```

**役割分担**:
| 対象 | 制御 |
|------|------|
| Vite ビルド生成 `<script>` `<link>` `<img>` | `vite.config.js` の `base` (= `ASSETS_URL[env]`) |
| HTML 内手書き `<a href>` | `url()` ヘルパー (= `LINK_MODE`) |
| `og:url` / `canonical` | `SITE_URL[env]` (常に絶対URL) |

**注意**: Vite `base` は `public/` 内ファイル (favicon 等) にも適用される → CDN化したくない場合は `ASSETS_URL.PROD=''` で `/` フォールバック維持。

---

## 12. render() ヘルパー

`include` の冗長記述を短縮する partial 呼出ヘルパー:

```ejs
<!-- 旧: include (引続き有効) -->
<%- include('../partials/Hero.ejs', { title: 'XXX', cta: 'YYY' }) %>

<!-- 新: render() -->
<%- render('Hero', { title: 'XXX', cta: 'YYY' }) %>
```

**仕様**:

- 第1引数 `name` → `src/partials/<Name>.ejs` 自動解決
- 第2引数 `props` → partial 内で local 変数として参照可能
- partial 内で `frontMatter` `data` `url` 等の renderContext を継承
- 既存 `include` 構文と完全併存 (Header.ejs 等 既存 partial は `include` 継続使用)

**メリット**:

- パス記述不要 (`../partials/` 省略)
- 拡張子不要 (`.ejs` 省略)
- partial 名一意化 → 検索容易

**注意**:

- partial 名衝突 (例: `Header` 重複) は誤動作の元 → `src/partials/` 直下のファイル名は一意に
- 同じ partial を ループ内で多用する LP では `include` でも `render()` でも同等のパフォーマンス

---

## 13. 納品手順

1. `public/images/og.jpg` を案件用 OGP 画像(1200×630px)に差替
   - デフォルトはダミー画像。SNSシェア時に表示される → **必ず差替**
   - ImageMagick での簡易生成例: `convert -size 1200x630 xc:#3498db -gravity center -pointsize 80 -fill white -annotate 0 'サービス名' public/images/og.jpg`
2. `.env` に本番用の ID / endpoint を設定 (Section 7, 8 参照)
3. `pnpm build:prod` で `dist/` 生成
4. **環境確認**: `EXPECTED_ENV=PROD pnpm verify` → `✓ Build env verified: PROD` を確認
5. `dist/` 内容をクライアントサーバへアップロード
6. 非圧縮・ハッシュなしのため、納品後の文言修正は `dist/*.html` 直接編集も可

---

## 14. トラブルシュート

**ビルドが失敗する (EJS エラー)**

- `src/data/*.json` の JSON 構文エラーを確認 (`node -e "JSON.parse(require('fs').readFileSync('src/data/xxx.json','utf8'))"`)
- EJS で `data.xxx` が undefined → `data.xxx?.yyy` でオプショナルチェインを使用

**dev サーバーでページが表示されない (404)**

- URL が `/foo/bar.html` の場合は `src/pages/foo/bar.ejs` が存在するか確認
- ルート (`/`) は `src/pages/index.ejs` にマッピング

**Analytics がビルドに出力されない**

- `pnpm build:prod` (BUILD_ENV=production) を使っているか確認
- `.env` の `ANALYTICS_GTM_ID` または `ANALYTICS_GA_ID` が設定されているか確認

**ContactForm が送信されない (fetch モード)**

- `.env` の `FORM_ENDPOINT_DEV` / `FORM_ENDPOINT_STG` / `FORM_ENDPOINT_PROD` が設定されているか確認
- ブラウザの DevTools → Network タブで POST リクエストを確認

**`LINK_MODE='relative'` でリンク切れ**

- ページの相対深さによって `../` の段数が変わる → ブラウザで Network タブで実際のリクエストURLを確認
- `pagePath` がサブディレクトリ階層を正しく反映しているか確認 (`/sample/nested.html` の場合 `../about.html` 出力が正常)
- `url()` 入力は **ルート相対** (`/` 始まり) 前提。誤って相対パス渡すと未加工で返却される

**CDN設定後 favicon・public/ ファイルが 404**

- Vite `base` は `public/` 内ファイル (favicon 等) にも適用される
- CDN にアセットを配置していない場合は `ASSETS_URL.PROD=''` で `/` フォールバック維持
- または CDN 側に `public/` 内ファイルもアップロード

**Sass deprecation warning が再発**

- `darken()` / `lighten()` 等の旧色関数を新規追加していないか確認
- `color.adjust($c, $lightness: -10%)` 形式に統一

---

## 15. セキュリティヘッダ設定

`docs/server-config/` にホスティング別のヘッダ設定雛形を同梱。案件のホスティング環境に合わせて配置する。

| ファイル             | 対象                       | 配置先                             |
| -------------------- | -------------------------- | ---------------------------------- |
| `_headers`           | Netlify / Cloudflare Pages | `dist/` 直下にコピーしてデプロイ   |
| `vercel.json`        | Vercel                     | リポジトリ root に配置             |
| `.htaccess`          | Apache                     | `dist/` 直下にコピー               |
| `nginx.conf.example` | Nginx                      | `include` ディレクティブで読み込み |

**注意**:

- `Strict-Transport-Security: preload` は HTTPS 必須。HTTP サイトでは削除すること
- GTM / GA 以外の外部スクリプト(フォントCDN等)を追加する場合は CSP の `script-src` / `style-src` / `font-src` を拡張
- `X-Content-Type-Options` は HTTP ヘッダでのみ有効(meta タグ不可) → server-config 側で担保

---

## 16. 構造化データ (JSON-LD)

`src/partials/StructuredData.ejs` が自動的に JSON-LD を `<head>` 内に出力する。

**デフォルト (Organization)**:

`data/site.json` の値を使用。`companyName` / `tel` / `email` / `address` / `sns` を自動反映。

```json
// src/data/site.json
{
  "companyName": "株式会社サンプル",
  "tel": "03-0000-0000",
  "email": "info@example.com",
  "address": "東京都千代田区〇〇1-1-1",
  "sns": {
    "twitter": "https://twitter.com/example"
  }
}
```

**FAQ ページ (FAQPage)**:

frontmatter で `structuredType: 'FAQPage'` を指定すると `data/faq.json` の内容で FAQPage スキーマを出力。

```yaml
---
title: 'よくある質問'
structuredType: 'FAQPage'
---
```

**logo 画像**:

デフォルトで `public/images/og.jpg` を流用。案件本番では `public/images/logo.png`(正方形推奨)を別途用意し、`StructuredData.ejs` L8 の `/images/og.jpg` を差し替えること。

---

## 17. パフォーマンス最適化 (preconnect / preload)

ページ frontmatter で外部ドメインへの事前接続・アセット先読みを設定できる。

```yaml
---
preconnect:
  - 'https://fonts.googleapis.com'
  - 'https://fonts.gstatic.com'
preload:
  - href: '/images/hero.jpg'
    as: image
    fetchpriority: high
  - href: '/fonts/main.woff2'
    as: font
    type: 'font/woff2'
    crossorigin: true
---
```

**Hero 画像 LCP 改善**:

- frontmatter の `preload` で `fetchpriority: high` を設定
- Hero セクション内の `<img>` タグにも直接 `fetchpriority="high" loading="eager"` を付与

```html
<img src="/images/hero.jpg" alt="..." width="1200" height="630" fetchpriority="high" loading="eager" />
```

---

## 18. スパム対策 (honeypot)

`ContactForm.ejs` に honeypot フィールドを実装済み。

- `name="website"` の非表示フィールドを設置
- `mode: 'fetch'` のフォームでのみ JS チェックが機能
- `mode: 'submit'` (通常 POST 遷移) の場合は Formspree 等のサービス側 honeypot 機能を利用すること(Formspree では `_gotcha` フィールドが相当)
