// src/lib/constants.js

/**
 * 環境変数
 * @type {boolean}
 */
export const isDev = process.env.NODE_ENV !== 'production';

/**
 * @type {boolean}
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * 環境の判定
 * @returns {'DEV' | 'PROD'} 現在の環境
 */
export const getCurrentEnv = () => {
  return isProd ? 'PROD' : 'DEV';
};

/**
 * URL設定
 * @type {Record<'DEV' | 'PROD', string>}
 */
export const SITE_URL = {
  DEV: 'http://dev.hoge.com/',
  PROD: 'http://prod.hoge.com/'
};

/**
 * @type {{ STATUS: boolean; DEV: string; PROD: string }}
 */
export const BASE_URL = {
  STATUS: false,
  DEV: '/hoge/',
  PROD: '/hoge/'
};

/**
 * @type {{ STATUS: boolean; DEV: string; PROD: string }}
 */
export const ASSETS_URL = {
  STATUS: false,
  DEV: 'http://dev.hoge.assets.com/',
  PROD: 'http://prod.hoge.assets.com/'
};

/**
 * 現在の環境に基づいたURLを取得する関数
 * @returns {string} サイトURL
 */
export const getCurrentSiteUrl = () => SITE_URL[getCurrentEnv()];

/**
 * @returns {string} ベースURL
 */
export const getCurrentBaseUrl = () => BASE_URL.STATUS ? BASE_URL[getCurrentEnv()] : '/';

/**
 * @returns {string} アセットURL
 */
export const getCurrentAssetsUrl = () => ASSETS_URL.STATUS ? ASSETS_URL[getCurrentEnv()] : '';

/**
 * サイトの基本情報
 * @type {{
 *   name: string;
 *   title: string;
 *   description: string;
 *   url: string;
 *   author: string;
 *   locale: string;
 *   defaultLocale: string;
 * }}
 */
export const SITE_CONFIG = {
  name: 'カスタム静的サイトジェネレーター',
  title: 'カスタム静的サイトジェネレーター',
  description: 'EJSとViteで構築した高速HTML生成環境',
  url: getCurrentSiteUrl(),
  author: 'あなたの名前',
  locale: 'ja_JP',
  defaultLocale: 'ja',
};

/**
 * SEO関連のデフォルト設定
 * @type {{
 *   ogType: string;
 *   ogImage: string;
 *   twitterCard: string;
 * }}
 */
export const SEO_DEFAULTS = {
  ogType: 'website',
  ogImage: '/assets/common/images/ogp_image.png',
  twitterCard: 'summary_large_image',
};

/**
 * パスの設定
 * @type {{
 *   images: {
 *     favicon: string;
 *     ogp: string;
 *     appleTouchIcon: string;
 *   };
 * }}
 */
export const PATHS = {
  images: {
    favicon: `${getCurrentAssetsUrl()}assets/common/images/favicon`,
    ogp: `${getCurrentAssetsUrl()}assets/common/images/ogp_image.png`,
    appleTouchIcon: `${getCurrentAssetsUrl()}assets/common/images/apple-touch-icon.png`,
  },
};

/**
 * サイト全体のメタデータデフォルト値
 * @type {{
 *   title: string;
 *   description: string;
 *   ogType: string;
 *   ogImage: string;
 * }}
 */
export const DEFAULT_PAGE_META = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  ogType: SEO_DEFAULTS.ogType,
  ogImage: SEO_DEFAULTS.ogImage,
};

/**
 * SNSのリンク
 * @type {{
 *   twitter: string;
 *   facebook: string;
 *   instagram: string;
 * }}
 */
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/hogehoge',
  facebook: 'https://facebook.com/hogehoge',
  instagram: 'https://instagram.com/hogehoge',
};

/**
 * テーマの設定
 * @type {{
 *   defaultTheme: string;
 *   themeStorageKey: string;
 * }}
 */
export const THEME_CONFIG = {
  defaultTheme: 'light',
  themeStorageKey: 'theme-preference',
};