# LP Builder (EJS × Vite)

LP納品最適化 静的サイトジェネレータ。

## 設計方針

このテンプレは「**編集容易性 > Lighthouse 100点**」のスタンス。

- JS/CSS/HTML 非圧縮 → Lighthouse Performance 上限あり (85〜90が現実値)
- ハッシュなしファイル名 → 長期キャッシュ最適化を犠牲に編集容易性確保
- LP納品先 (制作会社経由 等) で**コーダーが直接 dist/ を触る前提**

Lighthouse満点を最優先する場合、本テンプレは適合しない (別ツール推奨)。

## 特徴

- 非圧縮ビルド (HTML/CSS/JS Prettier整形済み)
- ファイル名ハッシュなし
- EJSテンプレ + Frontmatter
- Vite HMR

## クイックスタート

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # → dist/
pnpm preview  # dist/ 静的プレビュー
```

## ディレクトリ構造

```
src/
  layouts/    HTML骨格
  pages/      ページ実体 (frontmatter + コンテンツ)
  partials/   再利用部品
  lib/        定数・テンプレプロセッサ
  scripts/    クライアントJS
  scss/       Sass
public/       静的ファイル (dist/ にコピー)
dist/         納品物
```

## LP制作フロー

### 色変更

`src/scss/main.scss` の変数編集 → `pnpm dev` で即時反映

### 画像差替

`public/images/` に配置 → テンプレ内 `<img src="/images/xxx.png">` で参照

### 文言修正

`src/pages/*.ejs` を編集 → `pnpm build`

### ページ追加

`src/pages/new-page.ejs` を作成(frontmatter必須):

```yaml
---
title: 'ページタイトル'
description: 'metaディスクリプション'
ogImage: '/images/og.jpg'
layout: 'DefaultLayout'
---
```

## 納品手順

1. `pnpm build` で `dist/` 生成
2. `dist/` 内容をクライアントサーバへアップロード
3. 非圧縮・ハッシュなしのため、納品後の文言修正は `dist/*.html` 直接編集も可

## ライセンス

MIT
