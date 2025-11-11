const SCREENS = [
  { id: 'login', label: 'Tela de Login', href: './index.html' },
  { id: 'dashboard', label: 'Dashboard', href: './dashboard.html' }
]

function createToolbar() {
  if (document.getElementById('devToolbar')) {
    return
  }

  const toolbar = document.createElement('nav')
  toolbar.id = 'devToolbar'
  toolbar.className = 'dev-toolbar'
  toolbar.role = 'navigation'
  toolbar.ariaLabel = 'Barra de navegação de desenvolvimento'
  toolbar.innerHTML = `
    <span class="dev-toolbar__title">Ambiente de desenvolvimento</span>
    <div class="dev-toolbar__links">
      ${SCREENS.map((screen) => createLink(screen)).join('')}
    </div>
    <div class="dev-toolbar__actions">
      <button type="button" class="dev-toolbar__toggle" data-action="toggle">
        Ocultar barra
      </button>
    </div>
  `

  document.body.prepend(toolbar)
  document.body.classList.add('dev-toolbar-visible')
}

function createLink(screen) {
  const url = new URL(screen.href, window.location.origin)
  return `
    <a href="${url.pathname}${url.search}${url.hash}" data-screen="${screen.id}">
      ${screen.label}
    </a>
  `
}

function bindToolbarEvents() {
  const toolbar = document.getElementById('devToolbar')
  if (!toolbar) {
    return
  }

  toolbar.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    if (target.dataset.action === 'toggle') {
      toggleToolbarVisibility(toolbar, target)
    }
  })
}

function toggleToolbarVisibility(toolbar, toggleButton) {
  const isHidden = toolbar.classList.toggle('banner-hidden')
  if (isHidden) {
    document.body.classList.remove('dev-toolbar-visible')
    toggleButton.textContent = 'Mostrar barra'
  } else {
    document.body.classList.add('dev-toolbar-visible')
    toggleButton.textContent = 'Ocultar barra'
  }
}

function initDevToolbar() {
  const isProduction =
    typeof process !== 'undefined' &&
    process.env &&
    typeof process.env.NODE_ENV === 'string' &&
    process.env.NODE_ENV.toLowerCase() === 'production'
  if (isProduction) {
    return
  }

  createToolbar()
  bindToolbarEvents()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDevToolbar)
} else {
  initDevToolbar()
}

