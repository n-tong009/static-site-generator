// src/scripts/shared/env.js
// 最小環境検出。aislewire Selector の UA 解析は完全廃棄、CSS feature query で代替

/**
 * タッチデバイス判定（hover 不可デバイス = タッチ前提）
 * @returns {boolean}
 */
export const isTouch = () => window.matchMedia('(hover: none)').matches

/**
 * モーション低減設定判定
 * @returns {boolean}
 */
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
