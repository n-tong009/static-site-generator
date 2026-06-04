import Drawer from '../modules/Drawer.js'
import Reveal from '../modules/Reveal.js'

export default function index() {
  new Drawer().init()
  new Reveal().init()

  // ヒーロー通過後に固定LINEバーをフェードイン
  const hero = document.querySelector('.lp-hero')
  const lineBar = document.querySelector('.lp-line-bar')
  if (hero && lineBar) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        lineBar.classList.toggle('is-visible', !e.isIntersecting)
      })
    })
    io.observe(hero)
  }
}
