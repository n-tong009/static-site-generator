# EJSテンプレートルール

## 出力構文使い分け

- `<%= expr %>` — HTMLエスケープあり出力（テキスト・変数）
- `<%- expr %>` — 生出力（HTML断片・他テンプレinclude）
- `<% code %>` — 出力なし（if/for等制御）

## 空白・改行制御

- `<%_ code _%>` — 前後の空白行を潰す
- LP納品は整形済みHTMLを維持するため `<%_` `_%>` の濫用禁止
- ブロック制御は `<% if (...) { %>` + `<% } %>` で改行を残すこと

## パーシャル責務分離

- `src/layouts/` — HTML骨格（`<html>` 〜 `</html>` 全体）
- `src/pages/` — ページ本体（frontmatter + セクション組立て）
- `src/partials/` — 再利用部品（Header, Footer, 各セクション）

includeは `<%- include('../partials/Header.ejs', { locals }) %>` 形式。

## ヘルパー・URL管理

- URL・アセットパスは `src/lib/constants.js` の `BASE_URL` / `ASSETS_URL` 経由
- テンプレート内でのベタ書き（`/assets/main.js` 等）禁止
- 環境別URL切替は `constants.js` の `getCurrentEnv()` で一元管理

## EJS partial への props 渡し方（予約語に注意）

EJS はデフォルトで `with(data) {}` ブロック内でテンプレートをコンパイルする（`_with: true`）。
そのため **JavaScript 予約語をキー名に使うとサイレントに失敗**する。

**禁止**: `render('icon/Moon', { class: 'foo' })`  
**正解**: `render('icon/Moon', { iconClass: 'foo' })`

partial 側の受け取り方:

```ejs
<%
const _klass = typeof iconClass !== 'undefined' ? iconClass : ''
const _size  = typeof iconSize  !== 'undefined' ? iconSize  : 24
%>
```

`class` `delete` `return` `function` 等の予約語はキー名に使わないこと。

## frontmatter 必須宣言

各 `src/pages/*.ejs` の先頭 gray-matter ブロックで以下を必ず宣言:

```yaml
---
title: 'ページタイトル'
description: 'metaディスクリプション'
ogImage: '/images/og.jpg'
pageId: 'pageIdentifier'  # JS page router 連携。ファイル名と完全一致推奨（ハイフン → camelCase）
---
```

- `title` / `description` 未定義の場合は `constants.js` の `SITE_CONFIG` がフォールバック
- `pageId` 未宣言時はファイル名から自動推論（警告ログ出力）
- `pageId` の値が `src/scripts/pages/_index.js` の named export キーと一致する場合、対応するページ別 JS が自動実行される
