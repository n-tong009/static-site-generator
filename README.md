# LP Builder (EJS × Vite)

LP納品最適化 静的サイトジェネレータ。

## 特徴

- 非圧縮ビルド (HTML/CSS/JS Prettier整形済み)
- ファイル名ハッシュなし
- EJSテンプレ + Frontmatter
- Vite HMR

## クイックスタート

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # → dist/
npm run preview  # dist/ 静的プレビュー
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

`src/scss/main.scss` の変数編集 → `npm run dev` で即時反映

### 画像差替

`public/images/` に配置 → テンプレ内 `<img src="/images/xxx.png">` で参照

### 文言修正

`src/pages/*.ejs` を編集 → `npm run build`

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

1. `npm run build` で `dist/` 生成
2. `dist/` 内容をクライアントサーバへアップロード
3. 非圧縮・ハッシュなしのため、納品後の文言修正は `dist/*.html` 直接編集も可

## ライセンス

MIT
