// src/scripts/main.js
import '../scss/main.scss'
import './shared/contactForm.js'
import * as pages from './pages/_index.js'

/**
 * body.dataset.page を読み、対応するページ別関数を呼び出す
 */
function bootstrap() {
  window.app = {}
  const id = document.body.dataset.page
  if (id && typeof pages[id] === 'function') pages[id]()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap)
} else {
  bootstrap()
}
