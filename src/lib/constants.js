// src/lib/constants.js

/**
 * @type {boolean}
 */
export const isDev = process.env.NODE_ENV !== 'production'

/**
 * @type {boolean}
 */
export const isProd = process.env.NODE_ENV === 'production'

/**
 * BUILD_ENV 優先で環境判定
 * BUILD_ENV=staging → 'STG'
 * BUILD_ENV=production → 'PROD'
 * NODE_ENV=production → 'PROD'
 * それ以外 → 'DEV'
 * @returns {'DEV' | 'STG' | 'PROD'}
 */
export function getCurrentEnv() {
  const buildEnv = process.env.BUILD_ENV
  if (buildEnv === 'staging') return 'STG'
  if (buildEnv === 'production') return 'PROD'
  return process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
}

/**
 * @type {Record<'DEV' | 'STG' | 'PROD', string>}
 */
export const SITE_URL = {
  DEV: 'http://localhost:3000/',
  STG: 'https://stg.example.com/',
  PROD: 'https://example.com/',
}

/**
 * @type {{ STATUS: boolean; DEV: string; STG: string; PROD: string }}
 */
export const BASE_URL = {
  STATUS: false,
  DEV: '/',
  STG: '/',
  PROD: '/',
}

/**
 * Vite `base` に流す CDN プレフィックス。
 * 空文字 = `/` フォールバック (CDN不使用案件)。
 * @type {Record<'DEV' | 'STG' | 'PROD', string>}
 */
export const ASSETS_URL = {
  DEV: '/',
  STG: '', // 例: 'https://stg-cdn.example.com/'
  PROD: '', // 例: 'https://cdn.example.com/'
}

/**
 * HTML 内手書き `<a href>` の生成モード。
 * - 'relative' : `./about.html` `../about.html` (案件移植容易)
 * - 'root'     : `/about.html` (サイトルート起点)
 * - 'absolute' : `https://example.com/about.html` (常に絶対URL)
 *
 * og:url / canonical は LINK_MODE 影響受けず常に絶対URL (SITE_URL ベース)。
 * Vite アセット (script/link/img) は LINK_MODE 不適用 (vite.config.js の base 制御)。
 * @type {'relative' | 'root' | 'absolute'}
 */
export const LINK_MODE = 'relative'

/**
 * @returns {string}
 */
export const getCurrentSiteUrl = () => SITE_URL[getCurrentEnv()]

/**
 * @returns {string}
 */
export const getCurrentBaseUrl = () => (BASE_URL.STATUS ? BASE_URL[getCurrentEnv()] : '/')

/**
 * @returns {string}
 */
export const getCurrentAssetsUrl = () => ASSETS_URL[getCurrentEnv()] || '/'

/**
 * @type {{ name: string; title: string; description: string; url: string; author: string; locale: string; defaultLocale: string }}
 */
export const SITE_CONFIG = {
  name: 'LP Builder',
  title: 'LP Builder',
  description: 'EJS×Vite LP納品テンプレート',
  url: getCurrentSiteUrl(),
  author: '',
  locale: 'ja_JP',
  defaultLocale: 'ja',
}

/**
 * @type {{ ogType: string; ogImage: string; twitterCard: string }}
 */
export const SEO_DEFAULTS = {
  ogType: 'website',
  ogImage: '/images/og.jpg',
  twitterCard: 'summary_large_image',
}

/**
 * @type {{ images: { favicon: string; ogp: string; appleTouchIcon: string } }}
 */
export const PATHS = {
  images: {
    favicon: `${getCurrentAssetsUrl()}favicon`,
    ogp: `${getCurrentAssetsUrl()}images/og.jpg`,
    appleTouchIcon: `${getCurrentAssetsUrl()}images/apple-touch-icon.png`,
  },
}

/**
 * @type {{ title: string; description: string; ogType: string; ogImage: string }}
 */
export const DEFAULT_PAGE_META = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  ogType: SEO_DEFAULTS.ogType,
  ogImage: SEO_DEFAULTS.ogImage,
}

/**
 * @type {{ twitter: string; facebook: string; instagram: string }}
 */
export const SOCIAL_LINKS = {
  twitter: '',
  facebook: '',
  instagram: '',
}

/**
 * @type {{ defaultTheme: string; themeStorageKey: string }}
 */
export const THEME_CONFIG = {
  defaultTheme: 'light',
  themeStorageKey: 'theme-preference',
}

/**
 * Analytics 設定。PROD のみ有効。
 * gtmId / gaId は案件毎に差替。
 * @type {{ enabled: boolean; gtmId: string; gaId: string }}
 */
export const ANALYTICS = {
  enabled: {
    DEV: false,
    STG: false,
    PROD: true,
  },
  gtmId: '', // 例: 'GTM-XXXXXXX'
  gaId: '', // 例: 'G-XXXXXXXXXX' (GTM未使用時)
}

/**
 * @returns {boolean}
 */
export const isAnalyticsEnabled = () => ANALYTICS.enabled[getCurrentEnv()] === true

/**
 * フォーム設定。endpoint は案件毎に差替。
 * mode: 'submit' → 通常 POST (ページ遷移)
 * mode: 'fetch'  → 非同期 POST (メッセージ表示)
 * @type {{ endpoint: string; method: string; mode: 'submit'|'fetch'; thanksUrl: string; successMessage: string; errorMessage: string }}
 */
export const FORM_CONFIG = {
  endpoint: {
    DEV: '', // 例: 'https://formspree.io/f/dev-id'
    STG: '', // 例: 'https://formspree.io/f/stg-id'
    PROD: '', // 例: 'https://formspree.io/f/prod-id'
  },
  method: 'POST',
  mode: 'submit', // 'submit' or 'fetch'
  thanksUrl: '/thanks.html',
  successMessage: '送信完了。担当者より連絡。',
  errorMessage: '送信失敗。時間をおいて再度お試し。',
}

/**
 * @returns {string}
 */
export const getCurrentContactFormUrl = () => FORM_CONFIG.endpoint[getCurrentEnv()] || ''
