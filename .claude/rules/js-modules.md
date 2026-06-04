# JS モジュール設計ルール

## ディレクトリ構成

```
src/scripts/
  main.js          # 共通エントリ（SCSS import + shared import + page router）
  shared/          # 全ページ共通 utility / 副作用 entry
  pages/           # ページ別処理（pageId と1対1）
  modules/         # 再利用可能 UI 部品 Class
```

## 命名規則

- ファイル名は `kebab-case`（`carousel.js` `smooth-scroll.js`）
- ただし `modules/` の Class ファイルは `PascalCase`（`Carousel.js` `Modal.js`）
- `pages/*.js` のファイル名と frontmatter `pageId` は完全一致（ハイフン → camelCase）

## ESM ルール

- `window` グローバル汚染禁止（`window.app = {}` を除く）
- 名前空間は ESM named export で構築（`import * as pages from './pages/_index.js'`）
- 副作用 import は `shared/contactForm.js` 等の即時実行系のみ。utility は純粋 export

## ページ分岐ルール

- ページ別処理は `pages/<pageId>.js` の `default export function` で記述
- `body.dataset.page` で取得した pageId が `pages/_index.js` の named export キーと一致する場合のみ実行
- 不一致時はサイレント無視（エラーにしない）

## modules/ Class 規約

UI 部品は以下の3メソッド規約に従う:

```js
// src/scripts/modules/Carousel.js
import { qsa, on } from '../shared/dom.js'

export default class Carousel {
  /**
   * @param {string|Element} selector ルート要素のセレクタまたは要素
   * @param {Object} [options]
   */
  constructor(selector, options = {}) {
    this.el = typeof selector === 'string' ? document.querySelector(selector) : selector
    this.options = options
    this.offs = []
  }

  /**
   * イベント登録・状態構築。要素未取得時は no-op
   * @returns {this}
   */
  init() {
    if (!this.el) return this
    const items = qsa('[data-item]', this.el)
    items.forEach((item) => {
      const off = on(item, 'click', () => {
        /* ... */
      })
      this.offs.push(off)
    })
    return this
  }

  /**
   * イベント解除・状態解放。HMR / SPA 想定
   */
  destroy() {
    this.offs.forEach((off) => off())
    this.offs = []
  }
}
```

### 規約の理由

- `constructor` は副作用ナシ（DOM操作・event登録は `init()` で実行）
- `init()` は要素未取得時 no-op（防御的）
- `destroy()` は HMR / SPA 想定で必須。即時不要でも空実装で残す
- `on()` の戻り値（off関数）を `this.offs` に蓄積し destroy で一括解除

### 利用例（pages/index.js）

```js
import Carousel from '../modules/Carousel.js'

export default function index() {
  const carousel = new Carousel('[data-carousel]', { autoplay: true })
  carousel.init()
}
```

## 環境検出ルール

- UA文字列解析 禁止
- CSS feature query で代替不可な場合のみ `shared/env.js` の `isTouch()` / `prefersReducedMotion()` を使用
- `mobileType` `browserType` 等のグローバル禁止

## TypeScript

- 現フェーズ未採用
- 型注釈は JSDoc で記述（`@param` `@returns` `@type`）
- 将来導入時の移行コスト低減のため、JSDoc は厳密に書く

## jQuery / polyfill

- jQuery 採用禁止
- polyfill / html5shiv / selectivizr 不要（モダンブラウザ前提）

## Share系（Twitter/Facebook/LINE 等）

- デフォルト不採用
- 必要時に `modules/Share.js` 等を新規作成（aislewire の `Common.twitterShare` 等は移植しない）
