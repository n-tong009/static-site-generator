// src/scripts/main.js
import { THEME_CONFIG } from '../lib/constants.js';

/**
 * メインアプリケーションクラス
 * ページの初期化とイベント管理を担当
 */
class App {
  /**
   * アプリケーションの初期化
   */
  constructor() {
    this.isInitialized = false;
    this.testButton = null;
    
    // 初期化処理
    this.init();
  }

  /**
   * ページの読み込みが完了したときに実行される初期化関数
   */
  init() {
    if (this.isInitialized) return;
    
    console.log('ページが読み込まれました！');
    
    // ダークモード設定を復元
    this.restoreThemeSettings();
    
    // DOM要素を取得
    this.testButton = document.getElementById('testButton');
    
    // 各種セットアップを実行
    this.setupTestButton();
    this.setupMobileMenu();
    this.pageTransitionEffect();
    
    this.isInitialized = true;
  }

  /**
   * テストボタンのイベントハンドラをセットアップ
   */
  setupTestButton() {
    if (this.testButton) {
      this.testButton.addEventListener('click', () => {
        this.handleTestButtonClick();
      });
    }
  }

  /**
   * テストボタンクリック時の処理
   */
  handleTestButtonClick() {
    alert('ボタンがクリックされました！');
    console.log('Test button clicked at:', new Date().toISOString());
  }

  /**
   * モバイルメニューのセットアップ
   */
  setupMobileMenu() {
    // 実際のプロジェクトでは、ここにモバイルメニューの実装を追加
    // 例: ハンバーガーメニューの開閉処理など
    console.log('Mobile menu setup completed');
  }

  /**
   * ページ遷移時のアニメーション効果
   */
  pageTransitionEffect() {
    // ページ読み込み完了時のアニメーション
    document.body.classList.add('loaded');
    
    // 全てのリンクにクリックイベントを追加
    const links = document.querySelectorAll('a');
    links.forEach(link => this.setupLinkTransition(link));
  }

  /**
   * 個別のリンクに遷移効果を設定
   * @param {HTMLAnchorElement} link - リンク要素
   */
  setupLinkTransition(link) {
    // 外部リンクやハッシュリンクは除外
    if (
      link.hostname === window.location.hostname && 
      !link.hasAttribute('download') &&
      !link.getAttribute('href')?.startsWith('#')
    ) {
      link.addEventListener('click', (e) => {
        this.handleLinkClick(e, link);
      });
    }
  }

  /**
   * リンククリック時の処理
   * @param {Event} e - クリックイベント
   * @param {HTMLAnchorElement} link - クリックされたリンク
   */
  handleLinkClick(e, link) {
    const href = link.getAttribute('href');
    
    if (href) {
      e.preventDefault();
      
      // フェードアウトアニメーション
      document.body.classList.add('page-transition');
      
      // アニメーション後にページ遷移
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    }
  }

  /**
   * ダークモードの切り替え機能
   */
  toggleDarkMode() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (isDarkMode) {
      this.setLightMode();
    } else {
      this.setDarkMode();
    }
  }

  /**
   * ダークモードを設定
   */
  setDarkMode() {
    document.documentElement.classList.add('dark');
    localStorage.setItem(THEME_CONFIG.themeStorageKey, 'dark');
    console.log('Dark mode enabled');
  }

  /**
   * ライトモードを設定
   */
  setLightMode() {
    document.documentElement.classList.remove('dark');
    localStorage.setItem(THEME_CONFIG.themeStorageKey, 'light');
    console.log('Light mode enabled');
  }

  /**
   * ダークモード設定をローカルストレージから復元
   */
  restoreThemeSettings() {
    const savedTheme = localStorage.getItem(THEME_CONFIG.themeStorageKey);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    }
    // 設定がない場合はシステム設定に従う（CSS側で処理）
  }

  /**
   * アプリケーションの破棄処理
   */
  destroy() {
    // イベントリスナーの削除など、必要に応じてクリーンアップ処理を追加
    this.isInitialized = false;
    console.log('App destroyed');
  }
}

/**
 * テーマ管理クラス
 * ダークモード関連の機能を独立して管理
 */
class ThemeManager {
  /**
   * @param {App} app - メインアプリケーションインスタンス
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * システムの色設定変更を監視
   */
  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // ユーザーが手動で設定していない場合のみシステム設定に従う
      const savedTheme = localStorage.getItem(THEME_CONFIG.themeStorageKey);
      
      if (!savedTheme) {
        if (e.matches) {
          this.app.setDarkMode();
        } else {
          this.app.setLightMode();
        }
      }
    });
  }
}

// アプリケーションインスタンスを作成
let appInstance = null;

/**
 * アプリケーションを初期化する関数
 */
function initializeApp() {
  if (!appInstance) {
    appInstance = new App();
    
    // テーママネージャーも初期化
    const themeManager = new ThemeManager(appInstance);
    themeManager.watchSystemTheme();
    
    // グローバルでアクセスできるようにする
    window.app = appInstance;
    window.toggleDarkMode = () => appInstance.toggleDarkMode();
  }
}

// DOM読み込み完了時にアプリケーションを初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // 既にDOMが読み込まれている場合は即座に実行
  initializeApp();
}