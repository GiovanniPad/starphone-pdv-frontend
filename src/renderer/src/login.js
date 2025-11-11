import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

function handleLoginSubmit(event) {
  event.preventDefault()
  const form = event.currentTarget
  if (!(form instanceof HTMLFormElement)) {
    return
  }

  if (!form.checkValidity()) {
    event.stopPropagation()
    form.classList.add('was-validated')
    return
  }

  form.classList.add('was-validated')
  const submitButton = form.querySelector('button[type="submit"]')
  if (!(submitButton instanceof HTMLButtonElement)) {
    return
  }

  const originalLabel = submitButton.dataset.originalLabel ?? submitButton.textContent ?? 'Entrar'
  submitButton.disabled = true
  submitButton.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Entrando...
  `

  window.setTimeout(() => {
    submitButton.disabled = false
    submitButton.textContent = originalLabel

    const successAlert = document.createElement('div')
    successAlert.className = 'alert alert-success mt-3 mb-0'
    successAlert.setAttribute('role', 'status')
    successAlert.textContent = 'Login efetuado com sucesso. Redirecionando...'
    form.append(successAlert)

    window.setTimeout(() => {
      successAlert.remove()
    }, 2500)
  }, 1400)
}

function initLogin() {
  const form = document.getElementById('loginForm')
  if (form instanceof HTMLFormElement) {
    form.addEventListener('submit', handleLoginSubmit)
  }
}

document.addEventListener('DOMContentLoaded', initLogin)

