import { qsa } from '../shared/dom.js'
import { prefersReducedMotion } from '../shared/env.js'

export default class Reveal {
  /**
   * @param {string} [selector='.reveal']
   * @param {number} [threshold=0.1]
   */
  constructor(selector = '.reveal', threshold = 0.1) {
    this.selector = selector
    this.threshold = threshold
    this.io = null
  }

  init() {
    if (prefersReducedMotion()) return this

    const els = qsa(this.selector)
    if (!els.length) return this

    document.documentElement.classList.add('js-reveal')

    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            this.io.unobserve(e.target)
          }
        })
      },
      { threshold: this.threshold }
    )

    els.forEach((el) => this.io.observe(el))
    return this
  }

  destroy() {
    if (this.io) {
      this.io.disconnect()
      this.io = null
    }
    document.documentElement.classList.remove('js-reveal')
  }
}
