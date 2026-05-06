# CLAUDE.md — static-site-generator

EJS × Vite 単発LP納品テンプレ。Astro的なレイアウト・パーシャル・frontmatterをEJSで実現し、納品物（`dist/`）は非圧縮・可読状態で出力する。

## LP納品の絶対要件

- JS/CSS/HTML 圧縮禁止（`minify: false` / `cssMinify: false`）
- ファイル名ハッシュ禁止（`[name].js` / `[name].css` 固定）
- ビルド後 prettier 整形済みで出力
- `dist/` 構造は `src/pages/` に対応

## 主要コマンド

```bash
pnpm dev      # 開発サーバー
pnpm build    # 本番ビルド → dist/
pnpm preview  # dist/ の静的プレビュー
```

## ディレクトリ概要

```
src/
  layouts/    # HTML骨格
  pages/      # ページ（frontmatter + コンテンツ）
  partials/   # 再利用部品
  lib/        # 定数・テンプレプロセッサ
  scripts/    # クライアントJS
  scss/       # Sass
scripts/        # Viteカスタム起動スクリプト
public/       # 静的ファイル（dist/にコピー）
dist/         # 納品物
```

## 既知の未解決事項

| 問題                                                 | 状態               |
| ---------------------------------------------------- | ------------------ |
| `src/lib/sentry.js` 不存在 → `pnpm dev` 即死         | Phase 1 で除去予定 |
| `vite.config.js` 圧縮無効化・ハッシュ削除設定なし    | Phase 1 で修正予定 |
| `pageTransitionEffect()` が全 `<a>` タグを intercept | Phase 2 で削除予定 |
| `alert('ボタンがクリックされました！')` 残存         | Phase 2 で削除予定 |

詳細な実行手順 → `.claude/prompt/refactor-ejs-vite-lp.md`

## 関連ドキュメント

- `.claude/rules/general.md` — 全般ルール
- `.claude/rules/ejs-templates.md` — EJSテンプレートルール
- `.claude/rules/compressOutputToken.md` — 出力トークン圧縮
- `.claude/minutes/2026-05-04_ejs-vite-lp-review.md` — レビュー議事録
- `.claude/prompt/refactor-ejs-vite-lp.md` — Phase 1〜4 実装プロンプト
