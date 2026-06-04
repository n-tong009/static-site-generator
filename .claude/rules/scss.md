# SCSS設計規約

## ディレクトリ構造原則

- `common/` — reset / functions / vars / mixins（`_config.scss` で `@forward` 集約）
- `layouts/` — HTML骨格スタイル（body / main / a 等）
- `partials/` — 再利用コンポーネント（EJSコンポーネント名と1:1対応）
- `pages/` — ページ固有スタイル

## `@use` 記述規約

- 各 SCSS ファイル冒頭で `@use '../common/config' as *` を明示記述
- `vite.config.js` の `additionalData` 自動注入禁止
- `sass:math` が必要なファイルは別途 `@use 'sass:math'` を追加

## メディアクエリ規約

- `RESPONSIVE('PC', $MIN_WIDTH)` / `RESPONSIVE('SP', $MIN_WIDTH)` のみ使用
- `mq` mixin は使用禁止

## ファイル命名規約

- `partials/`: EJS コンポーネント名と完全一致（PascalCase）
  - 例: `HeroSection.ejs` → `_HeroSection.scss`、`Header.ejs` → `_Header.scss`
- `pages/`: EJS ページ名と一致（lowercase）
  - 例: `index.ejs` → `_index.scss`、`about.ejs` → `_about.scss`
- `common/` 配下: アンダースコアプレフィックス + camelCase（`_rootem.scss` 等）

## 変数化粒度

変数化する:

- ブランドカラー（`$COLOR_PRIMARY` 等）
- フォントファミリー（`$FONT_FAMILY`）
- ブレイクポイント（`$MIN_WIDTH` / `$MAX_WIDTH`）
- z-index 体系（`$Z_HEADER` 等）

変数化しない:

- margin / padding 値
- border-radius 値
- animation duration（コンポーネント固有）
- line-height 値（コンポーネント固有）

## partials 追加ルール

EJS コンポーネント追加時は SCSS partials を必ず並走して追加する:

1. `src/scss/partials/_<ComponentName>.scss` 作成
2. `src/scss/main.scss` に `@use 'partials/<ComponentName>';` 追加

## pages 追加ルール

EJS ページ追加時は SCSS pages を必ず並走して追加する（`pnpm new-page <name>` で自動化済み）:

1. `src/scss/pages/_<name>.scss` 作成
2. `src/scss/main.scss` に `@use 'pages/<name>';` 追加

## utils/ は使用しない

ユーティリティクラス（Tailwind風）は不採用。コンポーネント単位で直接記述する。
