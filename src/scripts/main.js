// src/scripts/main.js
import '../scss/main.scss'
import './contactForm.js'

function initializeApp() {
  window.app = {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
