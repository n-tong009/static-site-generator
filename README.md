# LP Builder (EJS × Vite)

LP納品に最適化した、EJS × Vite ベースの静的サイトジェネレータです。

Astroのような `layout` / component / frontmatter / JSON data の分離をEJSで実現しつつ、納品物である `dist/` はコーダーや制作会社が直接編集しやすい、非圧縮・ハッシュなし・整形済みのHTML/CSS/JSとして出力します。

## このテンプレートの用途

このテンプレートは、単発LPや小規模な静的サイトを「制作後に `dist/` 一式で納品する」案件向けです。

向いているケース:

- LP、キャンペーンページ、サービス紹介ページなどの静的HTML納品
- 制作会社やクライアント側で納品後に `dist/*.html` を直接修正する可能性がある案件
- EJSで部品化しながら、最終成果物は読みやすいHTML/CSS/JSにしたい案件
- STG / PROD で noindex、Analytics、フォーム送信先を切り替えたい案件

向いていないケース:

- Lighthouse Performance 100点を最優先する案件
- ファイル名ハッシュや長期キャッシュ最適化が必須の大規模サイト
- React/Vue等のアプリケーションUIが中心の案件
- CMS連携や動的ルーティングが前提の案件

## 設計方針

このテンプレートは「編集容易性 > Lighthouse 100点」のスタンスです。

- JS/CSS/HTML 非圧縮
- ファイル名ハッシュなし
- ビルド後のHTML/CSS/JSはPrettierで整形
- `dist/` のディレクトリ構造は `src/pages/` に対応
- LP納品先でコーダーが直接 `dist/` を触れる状態を優先

Lighthouse満点や強いキャッシュ戦略を最優先する場合は、別構成を推奨します。

## 要件

- Node.js `>=20`
- pnpm `10.x`

このリポジトリでは `packageManager` に `pnpm@10.33.4` を指定しています。

## クイックスタート

```bash
pnpm install
cp .env.example .env
pnpm dev
```

開発サーバーは `http://localhost:3000` で起動します。

本番用の `dist/` を作る場合:

```bash
pnpm build:prod
EXPECTED_ENV=PROD pnpm verify
pnpm preview
```

## セキュリティ運用

- ホストPCで `npm install` / `pnpm install` / `yarn install` を実行しない
- 依存インストールはdevコンテナ内で明示的に実行する
- `.github`、`.vscode`、`.claude`、`package.json`、lockfileの変更は人間レビュー必須
- production credential、npm publish token、AWS本番キー、Tauri署名secretはdevコンテナへ渡さない
- 危険差分の確認には `pnpm security:diff [BASE_REF]` を使用する

## コマンド一覧

| コマンド                        | 用途                                        |
| ------------------------------- | ------------------------------------------- |
| `pnpm dev`                      | 開発サーバー起動。EJS / SCSS / JSを確認     |
| `pnpm build`                    | productionビルド。`pnpm build:prod` と同等  |
| `pnpm build:prod`               | 本番ビルド。Analytics有効、noindex無効      |
| `pnpm build:stg`                | STGビルド。Analytics無効、noindex有効       |
| `pnpm preview`                  | `dist/` の静的プレビュー                    |
| `EXPECTED_ENV=PROD pnpm verify` | build manifestとCSS出力を検証               |
| `EXPECTED_ENV=STG pnpm verify`  | STGビルド結果を検証                         |
| `pnpm new-page campaign`        | `src/pages/campaign.ejs` とページSCSSを作成 |
| `pnpm lint`                     | ESLintチェック                              |
| `pnpm lint:fix`                 | ESLint自動修正                              |
| `pnpm format`                   | Prettier整形                                |
| `pnpm format:check`             | Prettierチェック                            |
| `pnpm verify:js`                | ページ別JS exportの疎通確認                 |
| `pnpm security:diff [BASE_REF]` | 危険差分の確認                              |

## ビルド出力の仕様

LP納品のため、Viteの標準的な最適化を一部止めています。

| 項目           | 仕様                                   |
| -------------- | -------------------------------------- |
| HTML           | 非圧縮、Prettier整形済み               |
| CSS            | `dist/assets/css/main.css`、非圧縮     |
| JS             | `dist/assets/js/main.js`、非圧縮       |
| ファイル名     | ハッシュなし                           |
| 静的ファイル   | `public/` から `dist/` へコピー        |
| sitemap        | `dist/sitemap.xml` を自動生成          |
| robots         | 環境別に `dist/robots.txt` を自動生成  |
| build manifest | `dist/.build-manifest.json` を自動生成 |

ページ出力例:

```text
src/pages/index.ejs          -> dist/index.html
src/pages/about.ejs          -> dist/about.html
src/pages/sample/nested.ejs  -> dist/sample/nested.html
```

## ディレクトリ構造

```text
.
├── src/
│   ├── pages/                 # ページ本体。frontmatter + EJSコンテンツ
│   ├── lib/
│   │   ├── components/
│   │   │   ├── layout/        # HTML骨格、head、header、footer、analytics等
│   │   │   └── shared/        # Hero、FAQ、CTA、ContactForm等の再利用部品
│   │   ├── data/              # EJSから data.xxx で参照するJSON
│   │   └── utils/             # 定数、URL生成、テンプレート処理
│   ├── scripts/
│   │   ├── main.js            # クライアントJSエントリ
│   │   ├── pages/             # ページ別JS
│   │   └── shared/            # 共通JS、フォーム処理、DOM utility等
│   └── scss/
│       ├── main.scss          # Sassエントリ
│       ├── common/            # 変数、mixin、function、reset
│       ├── layouts/           # レイアウトSCSS
│       ├── pages/             # ページ別SCSS
│       └── partials/          # component別SCSS
├── public/                    # 画像、favicon等。dist/へコピー
├── docs/                      # 詳細ガイド、サーバー設定例
├── scripts/                   # dev/build/new-page/verify用Nodeスクリプト
└── dist/                      # ビルド成果物。納品対象
```

## ページの作り方

ページは `src/pages/**/*.ejs` に作成します。各ページにはfrontmatterを置きます。

```ejs
---
title: 'ページタイトル'
description: 'metaディスクリプション'
layout: 'DefaultLayout'
pageId: 'campaign'
ogImage: '/images/og.jpg'
---

<%- render('HeroSection', {
  title: 'サービス名',
  lead: 'サービス説明文'
}) %>
```

主なfrontmatter:

| キー             | 用途                                       |
| ---------------- | ------------------------------------------ |
| `title`          | `<title>`、OGP、Twitter Cardに使用         |
| `description`    | meta description、OGPに使用                |
| `layout`         | 使用するlayout。通常は `DefaultLayout`     |
| `pageId`         | `body[data-page]` とページ別JS呼び出し名   |
| `ogImage`        | OGP画像。未指定時は `/images/og.jpg`       |
| `noindex`        | robots metaのindex制御                     |
| `nofollow`       | robots metaのfollow制御                    |
| `structuredType` | JSON-LD種別。例: `Organization`, `FAQPage` |
| `preconnect`     | 外部ドメインへの事前接続                   |
| `preload`        | Hero画像やfont等の先読み                   |
| `customHead`     | ページ固有のhead要素                       |
| `form`           | ContactFormのmode、thanksUrl等を上書き     |

`pageId` を省略した場合はファイルパスから推論されます。

```text
src/pages/index.ejs          -> pageId: index
src/pages/about.ejs          -> pageId: about
src/pages/sample/nested.ejs  -> pageId: sampleNested
```

## ページ追加

基本は `new-page` コマンドを使います。

```bash
pnpm new-page campaign
```

作成されるもの:

```text
src/pages/campaign.ejs
src/scss/pages/_campaign.scss
```

さらに `src/scss/main.scss` にページSCSSの `@use` が追加されます。

ページ固有JSが必要な場合は、手動で `src/scripts/pages/campaign.js` を作り、`src/scripts/pages/_index.js` から named export します。

```js
export { default as campaign } from './campaign.js'
```

`body[data-page]` の値と export 名が一致すると、`src/scripts/main.js` から自動実行されます。

## Componentの使い方

再利用部品は `src/lib/components/shared/` に置きます。

```text
src/lib/components/shared/HeroSection.ejs
src/lib/components/shared/FaqSection.ejs
src/lib/components/shared/ContactForm.ejs
```

ページ側では `render()` ヘルパーで呼び出せます。

```ejs
<%- render('FaqSection', { items: data.faq.items }) %>
```

`render()` は `src/lib/components/shared/` を優先して探し、なければ `src/lib/components/layout/` も参照します。従来のEJS `include` も利用できます。

## データ管理

JSONデータは `src/lib/data/` に置きます。EJSからは `data.ファイル名` で参照できます。

```text
src/lib/data/site.json          -> data.site
src/lib/data/faq.json           -> data.faq
src/lib/data/sections.json      -> data.sections
src/lib/data/testimonials.json  -> data.testimonials
```

EJSでの利用例:

```ejs
<p><%= data.site.companyName %></p>

<% data.faq.items.forEach((item) => { %>
<dt><%= item.q %></dt>
<dd><%= item.a %></dd>
<% }) %>
```

案件によっては、スプレッドシートからJSONを書き出して `src/lib/data/*.json` に配置すると、文言やFAQの更新を管理しやすくなります。

## スタイル管理

Sassのエントリは `src/scss/main.scss` です。

主な編集先:

| 変更内容           | 編集先                                |
| ------------------ | ------------------------------------- |
| 色、余白、幅など   | `src/scss/common/vars/_variable.scss` |
| breakpoint / mixin | `src/scss/common/`                    |
| ページ固有CSS      | `src/scss/pages/_*.scss`              |
| component別CSS     | `src/scss/partials/_*.scss`           |
| レイアウトCSS      | `src/scss/layouts/_*.scss`            |

ページやcomponentを追加した場合は、必要に応じて `src/scss/main.scss` に `@use` を追加します。

## JavaScript管理

クライアントJSのエントリは `src/scripts/main.js` です。

- `src/scripts/shared/` は共通処理
- `src/scripts/pages/` はページ固有処理
- `src/scripts/pages/_index.js` はページ別JSの export 集約

ページ別JSは `pageId` と export 名を一致させます。

```js
// src/scripts/pages/campaign.js
export default function campaign() {
  // campaignページでだけ動かす処理
}
```

```js
// src/scripts/pages/_index.js
export { default as campaign } from './campaign.js'
```

## 画像・静的ファイル

画像やfaviconは `public/` に配置します。

```text
public/images/og.jpg
public/images/apple-touch-icon.png
public/favicon.ico
public/favicon.png
public/favicon.svg
```

テンプレート内では基本的にルート相対パスで参照します。

```html
<img src="/images/hero.jpg" alt="" width="1200" height="630" />
```

納品前に必ず確認する画像:

- `public/images/og.jpg`
- `public/favicon.ico`
- `public/favicon.png`
- `public/favicon.svg`
- `public/images/apple-touch-icon.png`

## 環境別ビルド

`BUILD_ENV` によって、Analytics、noindex、URL生成が切り替わります。

| 環境 | コマンド          | Analytics | noindex | 用途         |
| ---- | ----------------- | --------- | ------- | ------------ |
| DEV  | `pnpm dev`        | 無効      | 無効    | ローカル開発 |
| STG  | `pnpm build:stg`  | 無効      | 有効    | 確認環境     |
| PROD | `pnpm build:prod` | 有効      | 無効    | 本番納品     |

環境別URLは `src/lib/utils/constants.js` で設定します。

```js
export const SITE_URL = {
  DEV: 'http://localhost:3000/',
  STG: 'https://stg.example.com/',
  PROD: 'https://example.com/'
}
```

## URLとアセットパス

HTML内のリンク生成は `url()` ヘルパーを使います。

```ejs
<a href="<%= url('/about.html') %>">About</a>
<img src="<%= url('/images/hero.jpg') %>" alt="" />
```

`src/lib/utils/constants.js` の `LINK_MODE` で出力形式を切り替えます。

| `LINK_MODE` | 出力イメージ                     | 用途                       |
| ----------- | -------------------------------- | -------------------------- |
| `relative`  | `./about.html`                   | デフォルト。移植しやすい   |
| `root`      | `/about.html`                    | サイトルート直下に置く案件 |
| `absolute`  | `https://example.com/about.html` | 絶対URLで固定したい案件    |

CSS/JS/画像などViteが扱うアセットURLは `ASSETS_URL` で制御します。

```js
export const ASSETS_URL = {
  DEV: '/',
  STG: '',
  PROD: ''
}
```

CDN配信する場合は `PROD: 'https://cdn.example.com/'` のように設定します。

## `.env` 設定

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

設定項目:

```bash
ANALYTICS_GTM_ID=
ANALYTICS_GA_ID=
FORM_ENDPOINT_DEV=
FORM_ENDPOINT_STG=
FORM_ENDPOINT_PROD=
```

`.env` は案件固有値を置く場所です。リポジトリへcommitしないでください。

## Analytics

AnalyticsはPRODビルドでのみ出力されます。

- GTM IDがある場合はGTMを優先
- GTM IDが空でGA4 IDがある場合はGA4を出力
- DEV / STGでは出力しない
- Consent Mode v2 default deny をGTM初期化前に出力

設定例:

```bash
ANALYTICS_GTM_ID=GTM-XXXXXXX
ANALYTICS_GA_ID=
```

## ContactForm

`src/lib/components/shared/ContactForm.ejs` は、環境別の送信先を `.env` から読みます。

```bash
FORM_ENDPOINT_DEV=https://example.test/dev
FORM_ENDPOINT_STG=https://example.test/stg
FORM_ENDPOINT_PROD=https://example.test/prod
```

endpointは `FORM_CONFIG.endpoint[env]` で固定されます。誤送信を防ぐため、frontmatterや `render()` 引数から endpoint は上書きできません。

endpoint以外の設定はfrontmatterで上書きできます。

```yaml
---
title: 'お問い合わせ'
form:
  mode: 'fetch'
  thanksUrl: '/thanks.html'
---
```

`mode` の違い:

| mode     | 動作                                     |
| -------- | ---------------------------------------- |
| `submit` | 通常POST送信。送信先サービス側へ遷移     |
| `fetch`  | 非同期POST送信。ページ内にメッセージ表示 |

honeypot用の `website` フィールドも実装済みです。

## SEO / OGP / JSON-LD

`src/lib/components/layout/Head.ejs` で以下を出力します。

- title
- meta description
- robots
- canonical
- OGP
- Twitter Card
- favicon / apple-touch-icon
- preconnect / preload
- Analytics
- JSON-LD

FAQ構造化データを出したいページでは、frontmatterに指定します。

```yaml
---
title: 'よくある質問'
structuredType: 'FAQPage'
---
```

Hero画像などLCPに関わる画像は、frontmatterの `preload` と画像タグの `fetchpriority` を併用します。

```yaml
---
preload:
  - href: '/images/hero.jpg'
    as: image
    fetchpriority: high
---
```

```html
<img src="/images/hero.jpg" alt="" width="1200" height="630" fetchpriority="high" loading="eager" />
```

## 納品前チェックリスト

`dist/` を渡す前に確認します。

- `SITE_URL.STG` / `SITE_URL.PROD` を案件URLへ変更した
- `ASSETS_URL` をCDN利用有無に合わせた
- `LINK_MODE` が納品先の配置方法に合っている
- `.env` に本番用Analytics IDを設定した
- `.env` にフォーム送信先を設定した
- `public/images/og.jpg` を案件用OGP画像へ差し替えた
- favicon / apple-touch-icon を案件用に差し替えた
- `pnpm build:prod` を実行した
- `EXPECTED_ENV=PROD pnpm verify` が成功した
- `pnpm preview` で `dist/` を確認した
- フォーム送信テストを行った
- 主要ページのtitle / description / OGPを確認した
- STGビルドでは noindex になっていることを確認した
- `dist/assets/css/main.css` と `dist/assets/js/main.js` が非圧縮で読めることを確認した

## よくある変更

### 文言を変える

ページ固有の文言は `src/pages/*.ejs` を編集します。共通データ化されている文言は `src/lib/data/*.json` を編集します。

### 色を変える

共通変数は `src/scss/common/vars/_variable.scss` を編集します。

### 画像を差し替える

`public/images/` に画像を置き、EJS内のパスを差し替えます。

```html
<img src="/images/new-hero.jpg" alt="" />
```

### componentを増やす

`src/lib/components/shared/NewSection.ejs` を作り、ページから呼び出します。

```ejs
<%- render('NewSection', { title: '見出し' }) %>
```

必要に応じて `src/scss/partials/_NewSection.scss` を作り、`src/scss/main.scss` に `@use` を追加します。

## トラブルシュート

### devサーバーで404になる

URLに対応するEJSがあるか確認します。

```text
/about.html          -> src/pages/about.ejs
/sample/nested.html  -> src/pages/sample/nested.ejs
/                    -> src/pages/index.ejs
```

### EJSエラーになる

- frontmatterの区切り `---` が正しいか確認
- `render('ComponentName')` の名前とファイル名が一致しているか確認
- `data.xxx` が存在するか確認

### JSONデータが読めない

`src/lib/data/*.json` の構文エラーを確認します。末尾カンマはJSONでは使えません。

### ページ別JSが動かない

- frontmatterの `pageId` を確認
- `src/scripts/pages/_index.js` に export があるか確認
- export名と `pageId` が一致しているか確認

### Analyticsが出力されない

- `pnpm build:prod` を使っているか確認
- `.env` に `ANALYTICS_GTM_ID` または `ANALYTICS_GA_ID` が入っているか確認
- DEV / STGでは仕様として出力されません

### ContactFormが送信できない

- `.env` の `FORM_ENDPOINT_*` を確認
- `mode: 'fetch'` の場合はブラウザのNetworkタブでPOSTを確認
- 送信先サービス側のCORSやドメイン制限を確認

### CSSやJSが圧縮されている

`vite.config.js` の以下を確認します。

```js
minify: false
cssMinify: false
```

また、出力ファイル名はハッシュなしに固定されています。

```js
entryFileNames: 'assets/js/[name].js'
assetFileNames: 'assets/css/[name][extname]'
```

## 詳細ドキュメント

より細かい実装ルールや運用手順は以下を参照してください。

- `docs/LP_BUILD_GUIDE.md`
- `.Codex/rules/general.md`
- `.Codex/rules/ejs-templates.md`
- `.Codex/rules/js-modules.md`
- `.Codex/prompt/refactor-ejs-vite-lp.md`
- `.Codex/prompt/refactor-js-design.md`

## ライセンス

MIT
