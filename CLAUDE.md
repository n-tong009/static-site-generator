# CLAUDE.md — static-site-generator

EJS × Vite 単発LP納品テンプレ。Astro的なレイアウト・パーシャル・frontmatterをEJSで実現し、納品物（`dist/`）は非圧縮・可読状態で出力する。

## LP納品の絶対要件

- JS/CSS/HTML 圧縮禁止（`minify: false` / `cssMinify: false`）
- ファイル名ハッシュ禁止（`[name].js` / `[name].css` 固定）
- ビルド後 prettier 整形済みで出力
- `dist/` 構造は `src/pages/` に対応

## 主要コマンド

```bash
pnpm dev              # 開発サーバー
pnpm build            # 本番ビルド → dist/
pnpm preview          # dist/ の静的プレビュー
pnpm verify           # ビルド成果物の検証
pnpm new-page <name>  # ページ雛形生成（EJS/SCSS 並走）
pnpm lint             # ESLint
```

## ディレクトリ概要

```
src/
  layouts/    # HTML骨格
  pages/      # ページ（frontmatter + コンテンツ）
  partials/   # 再利用部品
  lib/        # ヘルパー・データ
    utils/    # constants / templateProcessor / url
    data/     # サイト・セクション・FAQ 等の JSON
    components/
  scripts/    # クライアントJS
    shared/   # 共通utility・副作用entry
    pages/    # ページ別処理（pageId 1対1）
    modules/  # 再利用UI部品Class
  scss/       # Sass
scripts/        # Viteカスタム起動スクリプト
public/       # 静的ファイル（dist/にコピー）
dist/         # 納品物
```

## 関連ドキュメント

- `.claude/rules/general.md` — 全般ルール
- `.claude/rules/ejs-templates.md` — EJSテンプレートルール
- `.claude/rules/js-modules.md` — JSモジュール設計ルール
- `.claude/rules/scss.md` — SCSS設計規約
