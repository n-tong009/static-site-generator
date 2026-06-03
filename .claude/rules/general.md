# 全般ルール

- 必ず日本語で回答すること
- パッケージマネージャは pnpm を使用する（npm, yarn は使わない）
- コードスタイルは Prettier の設定に従う（セミコロンなし、シングルクォート、printWidth: 160）

## LP納品制約（絶対要件）

- `minify: false` / `cssMinify: false` — JS/CSS/HTML 圧縮禁止
- ファイル名にハッシュ付与禁止（`[name].js` / `[name].css` のみ）
- ビルド後 prettier で整形済みであること
- `dist/` の構造は `src/pages/` のディレクトリ構造に対応させる

## 作業フロー

- 実装・修正・調整の前に **Plan Mode** で計画を立て、ユーザー承認を得ること
- Plan Mode 優先ケース:
  - 複数ファイルにまたがる変更
  - 新機能の追加・既存機能の修正
  - ビルド設定・テンプレ構造に関わる変更
- 単純な誤字修正や1行以内の自明な修正のみ Plan Mode 省略可

## コマンド

- 開発サーバー: `pnpm dev`
- ビルド: `pnpm build`
- プレビュー: `pnpm preview`

## ディレクトリ構造

```
src/
  layouts/    # HTML骨格（<html>〜</html>全体）
  pages/      # ページ実体（frontmatter + コンテンツ）
  partials/   # 再利用部品（Header, Footer, Section等）
  lib/        # ヘルパー・データ
    utils/    # constants.js / url.js / templateProcessor.js
    data/     # サイト・セクション・FAQ 等の JSON
    components/
  scripts/    # クライアントサイドJS
    main.js   # エントリ（SCSS import + shared import + page router）
    shared/   # 共通utility・副作用entry（contactForm.js / env.js / dom.js）
    pages/    # ページ別処理（pageId と1対1の named export）
    modules/  # 再利用UI部品Class（constructor/init/destroy 規約）
  scss/       # Sass（main.scss エントリポイント）
scripts/      # Viteカスタム起動スクリプト（dev.js, build.js 等）
public/       # 静的ファイル（画像・favicon等）※ dist/ にそのままコピー
dist/         # ビルド出力（納品物）
```
