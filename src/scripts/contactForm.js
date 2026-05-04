// src/scripts/contactForm.js
document.querySelectorAll('[data-contact-form]').forEach((form) => {
  if (form.dataset.mode !== 'fetch') return

  const action = form.getAttribute('action')
  if (!action) {
    console.warn('[ContactForm] endpoint not set — fetch handler skipped')
    return
  }

  const msg = form.querySelector('[data-form-message]')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const successMsg = form.dataset.successMsg || '送信完了'
    const errorMsg = form.dataset.errorMsg || '送信失敗'

    try {
      const res = await fetch(action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      msg.textContent = res.ok ? successMsg : errorMsg
      msg.hidden = false
      if (res.ok) form.reset()
    } catch {
      msg.textContent = errorMsg
      msg.hidden = false
    }
  })
})
