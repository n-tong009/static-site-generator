export default function index() {
  const hero = document.querySelector('.lp-hero')
  if (!hero) return

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      document.body.classList.toggle('is-cta-visible', !e.isIntersecting)
    })
  })
  io.observe(hero)
}
