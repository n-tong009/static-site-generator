// src/lib/url.js
import path from 'path'
import { SITE_URL, LINK_MODE, getCurrentEnv } from './constants.js'

/**
 * HTML 内手書きパスを LINK_MODE に従って書換。
 * 入力は ルート相対 (`/foo/bar.html`) を前提。
 * 外部URL (`https://`)、`mailto:`、`tel:`、anchor (`#`)、空文字は無加工で返す。
 *
 * @param {string} targetPath - ルート相対パス (例: '/about.html')
 * @param {string} [currentPagePath='/'] - 現在ページのルート相対 (例: '/sample/nested.html')
 * @returns {string}
 */
export function url(targetPath, currentPagePath = '/') {
  if (!targetPath || typeof targetPath !== 'string') return targetPath
  if (!targetPath.startsWith('/')) return targetPath

  if (LINK_MODE === 'absolute') {
    const base = SITE_URL[getCurrentEnv()].replace(/\/$/, '')
    return base + targetPath
  }

  if (LINK_MODE === 'relative') {
    const fromDir = path.posix.dirname(currentPagePath) || '/'
    let rel = path.posix.relative(fromDir, targetPath)
    if (rel === '') rel = './'
    else if (!rel.startsWith('.')) rel = './' + rel
    return rel
  }

  return targetPath
}
