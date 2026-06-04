import { qs, qsa, on } from '../shared/dom.js'

export default class Drawer {
  /**
   * @param {Object} [options]
   * @param {string} [options.hamburger='#hamburger']
   * @param {string} [options.drawer='#drawer']
   * @param {string} [options.scrim='#scrim']
   * @param {string} [options.closeBtn='#navClose']
   */
  constructor(options = {}) {
    this.hamburgerSel = options.hamburger || '#hamburger'
    this.drawerSel = options.drawer || '#drawer'
    this.scrimSel = options.scrim || '#scrim'
    this.closeSel = options.closeBtn || '#navClose'
    this.hamburger = null
    this.drawer = null
    this.scrim = null
    this.closeBtn = null
    this.offs = []
  }

  init() {
    this.hamburger = qs(this.hamburgerSel)
    this.drawer = qs(this.drawerSel)
    this.scrim = qs(this.scrimSel)
    this.closeBtn = qs(this.closeSel)
    if (!this.hamburger || !this.drawer) return this

    this.offs.push(on(this.hamburger, 'click', () => this._toggle()))
    if (this.scrim) this.offs.push(on(this.scrim, 'click', () => this._close()))
    if (this.closeBtn) this.offs.push(on(this.closeBtn, 'click', () => this._close()))
    qsa('a', this.drawer).forEach((a) => {
      this.offs.push(on(a, 'click', () => this._close()))
    })
    this.offs.push(
      on(document, 'keydown', (e) => {
        if (e.key === 'Escape') this._close()
      })
    )
    return this
  }

  destroy() {
    this.offs.forEach((off) => off())
    this.offs = []
    this._close()
  }

  _toggle() {
    this._setOpen(!this.drawer.classList.contains('open'))
  }

  _close() {
    this._setOpen(false)
  }

  _setOpen(open) {
    this.drawer.classList.toggle('open', open)
    if (this.scrim) this.scrim.classList.toggle('open', open)
    this.hamburger.setAttribute('aria-expanded', open ? 'true' : 'false')
    document.body.style.overflow = open ? 'hidden' : ''
  }
}
