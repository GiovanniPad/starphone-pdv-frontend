import Modal from 'bootstrap/js/dist/modal'

/**
 * Abre um modal genérico de formulário
 * @param {Object} config - Configuração do modal
 * @param {string} config.modalId - ID do elemento modal
 * @param {string} config.titleId - ID do elemento de título
 * @param {string} config.submitButtonId - ID do botão de submit
 * @param {string} config.formId - ID do formulário
 * @param {string} config.mode - Modo do modal ('create' ou 'edit')
 * @param {Object} config.titles - Títulos { create: string, edit: string }
 * @param {Object} config.buttonTexts - Textos dos botões { create: string, edit: string }
 * @param {Object} config.fields - Objeto com campos { fieldId: value } ou função que retorna objeto
 * @param {Function} config.onBeforeOpen - Callback antes de abrir o modal (async)
 * @returns {Modal|null} - Instância do modal Bootstrap ou null
 */
export function openFormModal(config) {
  const {
    modalId,
    titleId,
    submitButtonId,
    formId,
    mode = 'create',
    titles = { create: 'Novo', edit: 'Editar' },
    buttonTexts = { create: 'Criar', edit: 'Salvar alterações' },
    fields = {},
    onBeforeOpen = null
  } = config

  const modalElement = document.getElementById(modalId)
  if (!modalElement) {
    console.error(`Modal ${modalId} não encontrado`)
    return null
  }

  let modal = Modal.getInstance(modalElement)
  if (!modal) {
    modal = new Modal(modalElement)
  }

  const isEditMode = mode === 'edit'

  // Atualizar título
  const modalTitle = titleId ? document.getElementById(titleId) : modalElement.querySelector('.modal-title')
  if (modalTitle) {
    modalTitle.textContent = isEditMode ? titles.edit : titles.create
  }

  // Atualizar botão de submit
  const submitButton = submitButtonId ? document.getElementById(submitButtonId) : modalElement.querySelector('button[type="submit"]')
  if (submitButton) {
    submitButton.textContent = isEditMode ? buttonTexts.edit : buttonTexts.create
  }

  // Preencher campos
  const fieldsToFill = typeof fields === 'function' ? fields() : fields
  Object.entries(fieldsToFill).forEach(([fieldId, value]) => {
    const field = document.getElementById(fieldId)
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = value || false
      } else if (field.tagName === 'SELECT') {
        // Para selects, assumimos que o valor é o ID da opção
        field.value = value || ''
      } else {
        field.value = value || ''
      }
    }
  })

  // Limpar validação anterior
  const form = formId ? document.getElementById(formId) : modalElement.querySelector('form')
  if (form) {
    form.classList.remove('was-validated')
  }

  // Callback antes de abrir (async)
  const openModal = async () => {
    if (onBeforeOpen) {
      await onBeforeOpen(modalElement, isEditMode)
    }
    modal.show()
  }

  // Executar abertura do modal (pode ser async)
  openModal().catch(error => {
    console.error('Erro ao abrir modal:', error)
  })

  return modal
}

/**
 * Abre um modal genérico de confirmação
 * @param {Object} config - Configuração do modal
 * @param {string} config.modalId - ID do elemento modal
 * @param {string} config.messageId - ID do elemento de mensagem
 * @param {string} config.confirmButtonId - ID do botão de confirmação
 * @param {string} config.message - Mensagem de confirmação
 * @param {Function} config.onConfirm - Callback quando confirmado (async)
 * @param {Object} config.buttonTexts - Textos dos botões { default: string, loading: string }
 * @param {number} config.zIndex - Z-index customizado (opcional)
 * @returns {Modal|null} - Instância do modal Bootstrap ou null
 */
export function openConfirmModal(config) {
  const {
    modalId,
    messageId,
    confirmButtonId,
    message,
    onConfirm,
    buttonTexts = { default: 'Confirmar', loading: 'Processando...' },
    zIndex = null
  } = config

  const modalElement = document.getElementById(modalId)
  if (!modalElement) {
    console.error(`Modal ${modalId} não encontrado`)
    return null
  }

  const modal = new Modal(modalElement)
  const messageElement = messageId ? document.getElementById(messageId) : modalElement.querySelector('[id*="Message"]')
  const confirmButton = confirmButtonId ? document.getElementById(confirmButtonId) : modalElement.querySelector('button.btn-danger, button.btn-primary')

  // Atualizar mensagem
  if (messageElement && message) {
    messageElement.textContent = message
  }

  // Remover listeners anteriores clonando o botão
  const newConfirmButton = confirmButton?.cloneNode(true)
  if (confirmButton && newConfirmButton) {
    confirmButton.parentNode?.replaceChild(newConfirmButton, confirmButton)
  }

  // Adicionar listener ao novo botão de confirmação
  const finalConfirmButton = confirmButtonId ? document.getElementById(confirmButtonId) : modalElement.querySelector('button.btn-danger, button.btn-primary')
  if (finalConfirmButton && onConfirm) {
    finalConfirmButton.addEventListener('click', async () => {
      if (finalConfirmButton) {
        finalConfirmButton.disabled = true
        finalConfirmButton.textContent = buttonTexts.loading
      }

      try {
        await onConfirm(modal)
      } catch (error) {
        console.error('Erro na confirmação:', error)
        throw error
      } finally {
        if (finalConfirmButton) {
          finalConfirmButton.disabled = false
          finalConfirmButton.textContent = buttonTexts.default
        }
      }
    })
  }

  modal.show()

  // Ajustar z-index se necessário
  if (zIndex !== null) {
    setTimeout(() => {
      modalElement.style.zIndex = String(zIndex)

      const backdrops = document.querySelectorAll('.modal-backdrop')
      if (backdrops.length > 1) {
        backdrops[backdrops.length - 1].style.zIndex = String(zIndex - 1)
      }
    }, 10)

    const handleModalHidden = () => {
      modalElement.style.zIndex = ''
      modalElement.removeEventListener('hidden.bs.modal', handleModalHidden)
    }
    modalElement.addEventListener('hidden.bs.modal', handleModalHidden)
  }

  return modal
}

/**
 * Fecha um modal
 * @param {string} modalId - ID do elemento modal
 */
export function closeModal(modalId) {
  const modalElement = document.getElementById(modalId)
  if (!modalElement) {
    return
  }

  const modal = Modal.getInstance(modalElement)
  if (modal) {
    modal.hide()
  }
}

