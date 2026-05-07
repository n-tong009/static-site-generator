// src/scripts/shared/dom.js
// 薄い DOM utility。jQuery 代替ではなく、頻出パターンのみ

/**
 * querySelector 短縮
 * @param {string} sel
 * @param {Document|Element} [ctx=document]
 * @returns {Element|null}
 */
export const qs = (sel, ctx = document) => ctx.querySelector(sel)

/**
 * querySelectorAll 短縮（Array で返す）
 * @param {string} sel
 * @param {Document|Element} [ctx=document]
 * @returns {Element[]}
 */
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel))

/**
 * addEventListener 短縮。off 関数を返す
 * @param {EventTarget} target
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean|AddEventListenerOptions} [opts]
 * @returns {() => void} off 関数
 */
export const on = (target, event, handler, opts) => {
  target.addEventListener(event, handler, opts)
  return () => target.removeEventListener(event, handler, opts)
}
