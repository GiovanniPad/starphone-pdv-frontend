import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Toast from 'bootstrap/js/dist/toast'
import Modal from 'bootstrap/js/dist/modal'
import { openFormModal, openConfirmModal, closeModal } from './modal-utils.js'
import {
  loadProducts,
  renderProductTable,
  renderSummary,
  filterProductsBySearch,
  setFilteredProducts,
  getProductById,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from './products.js'
import {
  loadCategories,
  renderCategoriesTable,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from './categories.js'
import { sortAlphabetically } from './utils.js'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR')

let employees = []
let filteredEmployees = []

// Função para filtrar funcionários por busca
function filterEmployeesBySearch(employeesList, searchValue) {
  if (!searchValue || searchValue.trim() === '') {
    return [...employeesList]
  }
  
  const value = searchValue.toLowerCase()
  return sortAlphabetically(employeesList.filter((employee) => {
    const fullName = employee.fullname || ''
    const email = employee.email || ''
    return (
      fullName.toLowerCase().includes(value) ||
      email.toLowerCase().includes(value)
    )
  }), 'fullname')
}

async function initDashboard() {
  // Aguardar um pouco para garantir que o preload terminou de carregar
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Expor showToast globalmente para o módulo de produtos
  window.showToast = showToast
  
  await loadProducts()
  await loadEmployees()
  bindEvents()
  initTabBarAnimation()
  updateFooterYear()
}

async function loadEmployees() {
  // Salvar o valor atual do campo de busca antes de recarregar
  const employeeSearchInput = document.getElementById('searchEmployee')
  const searchValue = employeeSearchInput?.value || ''
  
  const tableBody = document.getElementById('employeeTableBody')
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted py-4">
          <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
          Carregando funcionários...
        </td>
      </tr>
    `
  }

  try {
    if (!window.api?.getUsers) {
      throw new Error('API não disponível')
    }

    const result = await window.api.getUsers()
    
    if (result?.success && result.data) {
      employees = sortAlphabetically(Array.isArray(result.data) ? result.data : [], 'fullname')
      
      // Reaplicar o filtro de busca se houver um valor
      if (searchValue.trim() !== '') {
        filteredEmployees = filterEmployeesBySearch(employees, searchValue)
      } else {
        filteredEmployees = [...employees]
      }
      
      renderEmployeeTable()
      renderEmployeeSummary()
    } else {
      throw new Error(result?.error || 'Erro ao carregar funcionários')
    }
  } catch (error) {
    showToast(`Erro: ${error.message || 'Erro ao carregar funcionários'}`)
    employees = []
    filteredEmployees = []
    renderEmployeeTable()
    renderEmployeeSummary()
  }
}


function renderEmployeeTable() {
  const tableBody = document.getElementById('employeeTableBody')
  if (!tableBody) {
    return
  }

  if (filteredEmployees.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted py-4">
          Nenhum funcionário encontrado com os filtros atuais.
        </td>
      </tr>
    `
    return
  }

  tableBody.innerHTML = filteredEmployees
    .map((employee) => {
      const fullName = employee.fullname || ''
      const email = employee.email || ''
      const salary = employee.salary || 0
      const hireDate = formatDate(employee.hiring_date)
      const terminationDate = formatDate(employee.resignation_date)
      const isAdmin = employee.admin || false
      const adminBadgeClass = isAdmin ? 'bg-success text-white' : 'bg-secondary text-white'
      const adminLabel = isAdmin ? 'Admin' : 'Usuário'
      const isActive = employee.active !== undefined ? employee.active : true
      const activeBadgeClass = isActive ? 'bg-success text-white' : 'bg-danger text-white'
      const activeLabel = isActive ? 'Ativo' : 'Inativo'
      return `
        <tr data-employee-id="${employee.id}">
          <td>
            <div class="fw-semibold">${fullName}</div>
            <div class="text-muted small">ID #${employee.id}</div>
          </td>
          <td>
            <a href="mailto:${email}" class="text-decoration-none">${email}</a>
          </td>
          <td class="text-end fw-semibold">${currencyFormatter.format(salary)}</td>
          <td>${hireDate}</td>
          <td>${terminationDate}</td>
          <td class="text-center">
            <span class="badge ${adminBadgeClass}">${adminLabel}</span>
          </td>
          <td class="text-center">
            <span class="badge ${activeBadgeClass}">${activeLabel}</span>
          </td>
          <td class="text-end">
            <div class="action-buttons">
              <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                data-action="edit"
                data-entity="employee"
                data-employee-id="${employee.id}"
                title="Editar funcionário"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
              </button>
              <button
                type="button"
                class="btn ${isActive ? 'btn-outline-danger' : 'btn-outline-success'} btn-sm"
                data-action="delete"
                data-entity="employee"
                data-employee-id="${employee.id}"
                title="${isActive ? 'Inativar funcionário' : 'Reativar funcionário'}"
              >
                ${isActive ? `
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                  </svg>
                ` : `
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                `}
              </button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')
}

/**
 * Renderiza os cards de resumo dos funcionários
 */
function renderEmployeeSummary() {
  const summaryContainer = document.getElementById('employeeSummaryCards')
  if (!summaryContainer) {
    return
  }

  const totalEmployees = filteredEmployees.length
  const activeEmployees = filteredEmployees.filter(emp => emp.active !== undefined ? emp.active : true).length
  const inactiveEmployees = totalEmployees - activeEmployees
  const adminEmployees = filteredEmployees.filter(emp => emp.admin === true).length
  const totalPayroll = filteredEmployees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0)

  const summaryItems = [
    {
      id: 'total',
      label: 'Total de funcionários',
      value: `${totalEmployees}`,
      helper: `${activeEmployees} ativos, ${inactiveEmployees} inativos`
    },
    {
      id: 'active',
      label: 'Funcionários ativos',
      value: `${activeEmployees}`,
      helper: `${totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0}% do total`
    },
    {
      id: 'admin',
      label: 'Administradores',
      value: `${adminEmployees}`,
      helper: `${totalEmployees > 0 ? ((adminEmployees / totalEmployees) * 100).toFixed(1) : 0}% do total`
    },
    {
      id: 'payroll',
      label: 'Folha de pagamento',
      value: currencyFormatter.format(totalPayroll),
      helper: 'Somatório dos salários'
    }
  ]

  summaryContainer.innerHTML = summaryItems
    .map(
      (item) => `
        <article class="col-12 col-md-6 col-xl-3">
          <div class="summary-card card" data-type="${item.id}">
            <div class="d-flex align-items-center gap-3">
              <span class="summary-icon">${getEmployeeSummaryIcon(item.id)}</span>
              <div>
                <p class="text-muted mb-1">${item.label}</p>
                <h3>${item.value}</h3>
                <p class="small">${item.helper}</p>
              </div>
            </div>
          </div>
        </article>
      `
    )
    .join('')
}

/**
 * Retorna o ícone do resumo de funcionários baseado no tipo
 * @param {string} type - Tipo do resumo
 * @returns {string}
 */
function getEmployeeSummaryIcon(type) {
  const iconMap = {
    total: '👥',
    active: '✅',
    admin: '👑',
    payroll: '💰'
  }
  return iconMap[type] ?? 'ℹ️'
}

function initTabBarAnimation() {
  const tabButtons = document.querySelectorAll('.dashboard-tabs .nav-link')
  const tabList = document.querySelector('.dashboard-tabs')
  
  if (!tabList || tabButtons.length === 0) {
    return
  }
  
  // Criar barra animada única
  let animatedBar = document.querySelector('.tab-animated-bar')
  if (!animatedBar) {
    animatedBar = document.createElement('div')
    animatedBar.className = 'tab-animated-bar'
    tabList.appendChild(animatedBar)
  }
  
  // Função para atualizar posição da barra
  const updateBarPosition = (activeButton) => {
    if (!activeButton || !animatedBar) return
    
    const tabListRect = tabList.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()
    const buttonWidth = buttonRect.width
    const buttonLeft = buttonRect.left - tabListRect.left
    
    const barWidth = buttonWidth * 0.8
    const barLeft = buttonLeft + (buttonWidth - barWidth) / 2
    
    animatedBar.style.width = `${barWidth}px`
    animatedBar.style.left = `${barLeft}px`
    animatedBar.style.opacity = '1'
  }
  
  // Atualizar posição inicial
  const activeButton = document.querySelector('.dashboard-tabs .nav-link.active')
  if (activeButton) {
    updateBarPosition(activeButton)
  }
  
  // Observar mudanças nas tabs
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      setTimeout(() => {
        const newActiveButton = document.querySelector('.dashboard-tabs .nav-link.active')
        if (newActiveButton) {
          updateBarPosition(newActiveButton)
        }
      }, 10)
    })
  })
  
  // Observar mudanças de tamanho da janela
  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      const activeButton = document.querySelector('.dashboard-tabs .nav-link.active')
      if (activeButton) {
        updateBarPosition(activeButton)
      }
    }, 100)
  })
}

function bindEvents() {
  const searchInput = document.getElementById('searchProduct')
  const refreshButton = document.getElementById('refreshDashboard')
  const addProductButton = document.getElementById('addProductBtn')
  const categoriesButton = document.getElementById('categoriesBtn')
  const productTable = document.getElementById('productTableBody')
  const employeeSearchInput = document.getElementById('searchEmployee')
  const addEmployeeButton = document.getElementById('addEmployeeBtn')
  const employeeTable = document.getElementById('employeeTableBody')
  const logoutButton = document.getElementById('logoutBtn')

  searchInput?.addEventListener('input', (event) => {
    const value = event.target.value
    const filtered = filterProductsBySearch(getProducts(), value)
    setFilteredProducts(filtered)
    renderSummary()
    renderProductTable()
  })

  refreshButton?.addEventListener('click', async () => {
    const search = document.getElementById('searchProduct')
    if (search) {
      search.value = ''
    }
    await loadProducts()
    showToast('Dados atualizados com sucesso!')
  })

  addProductButton?.addEventListener('click', () => {
    openProductModal('create')
  })

  categoriesButton?.addEventListener('click', async () => {
    await openCategoriesModal()
  })

  productTable?.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    const actionButton = target.closest('button[data-action][data-product-id]')
    if (!(actionButton instanceof HTMLElement)) {
      return
    }

    const action = actionButton.dataset.action
    const productId = Number(actionButton.dataset.productId)
    const product = getProductById(productId)
    if (!product) {
      showToast('Produto não encontrado.')
      return
    }

    if (action === 'edit') {
      handleEditProduct(product)
    } else if (action === 'delete') {
      handleDeleteProduct(product)
    }
  })

  employeeSearchInput?.addEventListener('input', (event) => {
    const value = event.target.value
    filteredEmployees = filterEmployeesBySearch(employees, value)
    renderEmployeeTable()
    renderEmployeeSummary()
  })

  addEmployeeButton?.addEventListener('click', () => {
    handleCreateEmployee()
  })

  employeeTable?.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    const actionButton = target.closest('button[data-action][data-employee-id]')
    if (!(actionButton instanceof HTMLElement)) {
      return
    }

    const action = actionButton.dataset.action
    const employeeId = Number(actionButton.dataset.employeeId)
    const employee = employees.find((item) => item.id === employeeId)
    if (!employee) {
      showToast('Funcionário não encontrado.')
      return
    }

    if (action === 'edit') {
      handleEditEmployee(employee)
    } else if (action === 'delete') {
      handleDeleteEmployee(employee)
    }
  })

  // Handler do formulário de funcionário (criação/edição)
  const employeeForm = document.getElementById('employeeForm')
  const productForm = document.getElementById('productForm')
  productForm?.addEventListener('submit', async (event) => {
    event.preventDefault()
    event.stopPropagation()

    const form = event.target
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    const formData = new FormData(form)
    const mode = formData.get('mode') || 'create'
    const productId = Number(formData.get('id'))
    const productData = {
      name: formData.get('name') || '',
      category_id: Number(formData.get('category_id')),
      quantity: Number(formData.get('quantity')) || 0,
      cost_value: Number(formData.get('cost_value')) || 0,
      profit_value: Number(formData.get('profit_value')) || 0
    }

    // Desabilitar botão durante a requisição
    const submitButton = form.querySelector('button[type="submit"]')
    const originalButtonText = submitButton?.textContent || 'Salvar'
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = mode === 'create' ? 'Criando...' : 'Salvando...'
    }

    try {
      const result = mode === 'create'
        ? await createProduct(productData)
        : await updateProduct(productId, productData)

      if (!result?.success) {
        throw new Error(result?.error || 'Erro desconhecido')
      }

      // Fechar modal
      closeModal('productModal')

      // Recarregar produtos
      await loadProducts()
      showToast(mode === 'create' 
        ? 'Produto criado com sucesso!' 
        : 'Produto atualizado com sucesso!')
    } catch (error) {
      showToast(`Erro: ${error.message || 'Erro desconhecido'}`)
    } finally {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = originalButtonText
      }
    }
  })

  employeeForm?.addEventListener('submit', async (event) => {
    event.preventDefault()
    event.stopPropagation()

    const form = event.target
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    const formData = new FormData(form)
    const mode = formData.get('mode') || 'edit'
    const employeeId = Number(formData.get('id'))
    const originalEmail = formData.get('originalEmail') || ''

    // Preparar dados para envio à API
    const salaryStr = formData.get('salary') || '0'
    const salary = parseFloat(salaryStr)
    const salaryInput = document.getElementById('employeeSalary')
    
    // Validar salário mínimo
    if (isNaN(salary) || salary < 1) {
      if (salaryInput) {
        salaryInput.setCustomValidity('O salário deve ser no mínimo R$ 1,00.')
        salaryInput.reportValidity()
      }
      form.classList.add('was-validated')
      return
    }
    
    // Limpar validação customizada do salário se passou
    if (salaryInput) {
      salaryInput.setCustomValidity('')
    }
    
    const userData = {
      fullname: formData.get('fullname') || '',
      email: formData.get('email') || '',
      salary: salary,
      admin: formData.get('admin') === 'on'
    }

    // Na criação, sempre incluir active como true
    if (mode === 'create') {
      userData.active = true
    }

    // Validar e adicionar senha
    const password = formData.get('password') || ''
    const passwordInput = document.getElementById('employeePassword')
    
    if (mode === 'create') {
      // Na criação, senha é obrigatória
      if (password.trim() === '') {
        if (passwordInput) {
          passwordInput.setCustomValidity('A senha é obrigatória para criar um novo funcionário.')
          passwordInput.reportValidity()
        }
        form.classList.add('was-validated')
        return
      }
      if (password.trim().length < 6) {
        if (passwordInput) {
          passwordInput.setCustomValidity('A senha deve ter no mínimo 6 caracteres.')
          passwordInput.reportValidity()
        }
        form.classList.add('was-validated')
        return
      }
      userData.password = password
    } else {
      // Na edição, senha é opcional, mas se preenchida deve ter no mínimo 6 caracteres
      if (password.trim() !== '') {
        if (password.trim().length < 6) {
          if (passwordInput) {
            passwordInput.setCustomValidity('A senha deve ter no mínimo 6 caracteres.')
            passwordInput.reportValidity()
          }
          form.classList.add('was-validated')
          return
        }
        userData.password = password
      }
    }
    
    // Limpar validação customizada se passou nas validações
    if (passwordInput) {
      passwordInput.setCustomValidity('')
    }

    // Desabilitar botão de submit durante a requisição
    const submitButton = form.querySelector('button[type="submit"]')
    const originalButtonText = submitButton?.textContent || 'Salvar'
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = mode === 'create' ? 'Criando...' : 'Salvando...'
    }

    try {
      if (!window.api) {
        throw new Error('API não disponível')
      }

      if (mode === 'edit' && !originalEmail) {
        throw new Error('E-mail original não encontrado')
      }

      const result = mode === 'create'
        ? await window.api.createUser(userData)
        : await window.api.updateUser(originalEmail, userData)

      if (!result?.success) {
        throw new Error(result?.error || 'Erro desconhecido')
      }

      await loadEmployees()
      
      closeModal('employeeModal')

      showToast(mode === 'create' 
        ? 'Funcionário criado com sucesso!' 
        : 'Funcionário atualizado com sucesso!')
    } catch (error) {
      showToast(`Erro: ${error.message || 'Erro desconhecido'}`)
    } finally {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = originalButtonText
      }
    }
  })

  logoutButton?.addEventListener('click', (event) => {
    event.preventDefault()
    handleLogout()
  })
}

/**
 * Realiza o logout do usuário
 */
function handleLogout() {
  // Redirecionar para a página de login
  window.location.href = 'index.html'
}

function handleEditProduct(product) {
  openProductModal('edit', product)
}

async function handleDeleteProduct(product) {
  if (!product) {
    showToast('Produto não encontrado.')
    return
  }

  const productName = product.name || 'N/A'
  
  openConfirmModal({
    modalId: 'deleteProductModal',
    messageId: 'deleteProductMessage',
    confirmButtonId: 'confirmDeleteProductBtn',
    message: `Tem certeza que deseja excluir o produto "${productName}"?`,
    buttonTexts: { default: 'Excluir', loading: 'Excluindo...' },
    zIndex: 1057,
    onConfirm: async (modal) => {
      const result = await deleteProduct(product.id)
      
      if (result?.success) {
        modal.hide()
        await loadProducts()
        showToast(`Produto "${productName}" excluído com sucesso!`)
      } else {
        throw new Error(result?.error || 'Erro ao excluir produto')
      }
    }
  })
}

async function openProductModal(mode = 'create', product = null) {
  const isEditMode = mode === 'edit'
  
  openFormModal({
    modalId: 'productModal',
    titleId: 'productModalLabel',
    submitButtonId: 'productSubmitButton',
    formId: 'productForm',
    mode,
    titles: { create: 'Novo Produto', edit: 'Editar Produto' },
    buttonTexts: { create: 'Criar produto', edit: 'Salvar alterações' },
    fields: {
      productMode: mode,
      productId: product?.id || '',
      productName: product?.name || '',
      productQuantity: product?.quantity || 0,
      productCostValue: product?.cost_value || 0,
      productProfitValue: product?.profit_value || 0
    },
    onBeforeOpen: async (modalElement, isEdit) => {
      // Carregar e preencher categorias
      let categories = []
      try {
        categories = await loadCategories()
      } catch (error) {
        showToast(`Erro ao carregar categorias: ${error.message}`)
      }
      
      const categorySelect = document.getElementById('productCategory')
      if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>'
        categories.forEach(category => {
          const option = document.createElement('option')
          option.value = category.id
          option.textContent = category.name
          if (isEdit && product?.category?.id === category.id) {
            option.selected = true
          }
          categorySelect.appendChild(option)
        })
      }
    }
  })
}

function openEmployeeModal(mode, employee = null) {
  const isEditMode = mode === 'edit'
  
  const fields = {
    employeeMode: mode,
    employeeId: employee?.id || '',
    employeeOriginalEmail: employee?.email || '',
    employeeFullname: employee?.fullname || '',
    employeeEmail: employee?.email || '',
    employeeSalary: employee?.salary || 0,
    employeePassword: ''
  }
  
  if (isEditMode && employee) {
    const hiringDate = employee.hiring_date ? formatDateForInput(employee.hiring_date) : ''
    const resignationDate = employee.resignation_date ? formatDateForInput(employee.resignation_date) : ''
    fields.employeeHiringDate = hiringDate
    fields.employeeResignationDate = resignationDate
    fields.employeeAdmin = employee.admin || false
  } else {
    fields.employeeHiringDate = ''
    fields.employeeResignationDate = ''
    fields.employeeAdmin = false
  }
  
  openFormModal({
    modalId: 'employeeModal',
    titleId: 'employeeModalLabel',
    submitButtonId: 'employeeSubmitButton',
    formId: 'employeeForm',
    mode,
    titles: { create: 'Novo Funcionário', edit: 'Editar Funcionário' },
    buttonTexts: { create: 'Criar funcionário', edit: 'Salvar alterações' },
    fields,
    onBeforeOpen: async (modalElement, isEdit) => {
      const passwordInput = document.getElementById('employeePassword')
      const passwordHelp = document.getElementById('employeePasswordHelp')
      const hiringDateContainer = document.getElementById('employeeHiringDateContainer')
      const resignationDateContainer = document.getElementById('employeeResignationDateContainer')
      
      if (passwordInput) {
        passwordInput.placeholder = isEdit 
          ? 'Deixe em branco para não alterar' 
          : 'Digite a senha do funcionário'
        passwordInput.setCustomValidity('')
        if (isEdit) {
          passwordInput.removeAttribute('required')
          passwordInput.removeAttribute('minlength')
        } else {
          passwordInput.setAttribute('required', 'required')
          passwordInput.setAttribute('minlength', '6')
        }
      }
      if (passwordHelp) {
        passwordHelp.textContent = isEdit
          ? 'Deixe em branco se não desejar alterar a senha.'
          : 'A senha é obrigatória para criar um novo funcionário.'
      }
      
      if (hiringDateContainer) {
        hiringDateContainer.style.display = isEdit ? 'block' : 'none'
      }
      if (resignationDateContainer) {
        resignationDateContainer.style.display = isEdit ? 'block' : 'none'
      }
    }
  })
}

function handleEditEmployee(employee) {
  openEmployeeModal('edit', employee)
}

function handleCreateEmployee() {
  openEmployeeModal('create')
}

async function handleDeleteEmployee(employee) {
  try {
    if (!window.api) {
      throw new Error('API não disponível')
    }

    const fullName = employee.fullname || 'N/A'
    const email = employee.email || ''
    const isActive = employee.active !== undefined ? employee.active : true

    if (!email) {
      throw new Error('E-mail do funcionário não encontrado')
    }

    // Usar rotas específicas para desativar/reativar
    const result = isActive
      ? await window.api.deactivateUser(email)
      : await window.api.reactivateUser(email)

    if (!result?.success) {
      throw new Error(result?.error || 'Erro ao atualizar status do funcionário')
    }

    // Recarregar a lista de funcionários
    await loadEmployees()

    showToast(isActive
      ? `Funcionário ${fullName} inativado com sucesso!` 
      : `Funcionário ${fullName} reativado com sucesso!`)
  } catch (error) {
    showToast(`Erro: ${error.message || 'Erro ao atualizar status do funcionário'}`)
  }
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateFormatter.format(date)
}

function formatDateForInput(value) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  // Formatar para YYYY-MM-DD (formato do input date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

function showToast(message) {
  const toastContainerId = 'dashboardToastContainer'
  let toastContainer = document.getElementById(toastContainerId)

  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = toastContainerId
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3'
    document.body.appendChild(toastContainer)
  }

  const toastElement = document.createElement('div')
  toastElement.className = 'toast align-items-center text-bg-primary border-0 show'
  toastElement.setAttribute('role', 'status')
  toastElement.setAttribute('aria-live', 'polite')
  toastElement.setAttribute('aria-atomic', 'true')
  toastElement.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>
  `

  toastContainer.appendChild(toastElement)

  const toast = new Toast(toastElement, { delay: 2500 })
  toast.show()

  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove()
  })
}

function updateFooterYear() {
  const yearElement = document.getElementById('currentYear')
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear())
  }
}

async function openCategoriesModal() {
  const modalElement = document.getElementById('categoriesModal')
  if (!modalElement) {
    showToast('Erro: Modal de categorias não encontrado.')
    return
  }

  const modal = new Modal(modalElement)
  
  // Mostrar loading
  const tableBody = document.getElementById('categoriesTableBody')
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-muted py-4">
          <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
          Carregando categorias...
        </td>
      </tr>
    `
  }
  
  // Abrir o modal
  modal.show()
  
  // Carregar categorias
  await refreshCategoriesTable()
  
  // Bind events da tabela de categorias
  bindCategoryTableEvents(modalElement)
}

async function refreshCategoriesTable() {
  const tableBody = document.getElementById('categoriesTableBody')
  if (!tableBody) {
    return
  }
  
  try {
    const categories = await loadCategories()
    renderCategoriesTable(categories)
  } catch (error) {
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="2" class="text-center text-danger py-4">
            Erro ao carregar categorias.
          </td>
        </tr>
      `
    }
  }
}

// Variáveis para armazenar os event listeners e evitar duplicação
let categoryTableClickHandler = null
let categoryFormSubmitHandler = null
let addCategoryButtonClickHandler = null

function bindCategoryTableEvents(modalElement) {
  const addCategoryButton = document.getElementById('addCategoryBtn')
  const categoryTable = document.getElementById('categoriesTableBody')
  
  // Remover listeners antigos se existirem
  if (addCategoryButtonClickHandler) {
    addCategoryButton?.removeEventListener('click', addCategoryButtonClickHandler)
  }
  if (categoryTableClickHandler) {
    categoryTable?.removeEventListener('click', categoryTableClickHandler)
  }
  
  // Botão de adicionar categoria
  addCategoryButtonClickHandler = () => {
    openCategoryModal('create')
  }
  addCategoryButton?.addEventListener('click', addCategoryButtonClickHandler)
  
  // Event listeners da tabela
  categoryTableClickHandler = async (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    const actionButton = target.closest('button[data-action][data-category-id]')
    if (!(actionButton instanceof HTMLElement)) {
      return
    }

    const action = actionButton.dataset.action
    const categoryId = Number(actionButton.dataset.categoryId)
    
    if (action === 'edit') {
      const category = await getCategoryById(categoryId)
      if (category) {
        openCategoryModal('edit', category)
      } else {
        showToast('Categoria não encontrada.')
      }
    } else if (action === 'delete') {
      await handleDeleteCategory(categoryId)
    }
  }
  categoryTable?.addEventListener('click', categoryTableClickHandler)
  
  // Handler do formulário de categoria
  const categoryForm = document.getElementById('categoryForm')
  
  // Remover listener antigo se existir
  if (categoryFormSubmitHandler) {
    categoryForm?.removeEventListener('submit', categoryFormSubmitHandler)
  }
  
  categoryFormSubmitHandler = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    const form = event.target
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    const formData = new FormData(form)
    const mode = formData.get('mode') || 'edit'
    const categoryId = Number(formData.get('id'))
    const categoryData = {
      name: formData.get('name') || ''
    }

    // Desabilitar botão de submit durante a requisição
    const submitButton = form.querySelector('button[type="submit"]')
    const originalButtonText = submitButton?.textContent || 'Salvar'
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = mode === 'create' ? 'Criando...' : 'Salvando...'
    }

    try {
      const result = mode === 'create'
        ? await createCategory(categoryData)
        : await updateCategory(categoryId, categoryData)

      if (!result?.success) {
        throw new Error(result?.error || 'Erro desconhecido')
      }

      await refreshCategoriesTable()
      
      const categoryModalElement = document.getElementById('categoryModal')
      const categoryModal = Modal.getInstance(categoryModalElement)
      if (categoryModal) {
        categoryModal.hide()
        // Resetar z-index após fechar
        if (categoryModalElement) {
          categoryModalElement.style.zIndex = ''
        }
      }

      showToast(mode === 'create' 
        ? 'Categoria criada com sucesso!' 
        : 'Categoria atualizada com sucesso!')
    } catch (error) {
      showToast(`Erro: ${error.message || 'Erro desconhecido'}`)
    } finally {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = originalButtonText
      }
    }
  }
  categoryForm?.addEventListener('submit', categoryFormSubmitHandler)
}

function openCategoryModal(mode, category = null) {
  openFormModal({
    modalId: 'categoryModal',
    titleId: 'categoryModalLabel',
    submitButtonId: 'categorySubmitButton',
    formId: 'categoryForm',
    mode,
    titles: { create: 'Nova Categoria', edit: 'Editar Categoria' },
    buttonTexts: { create: 'Criar categoria', edit: 'Salvar alterações' },
    fields: {
      categoryMode: mode,
      categoryId: category?.id || '',
      categoryName: category?.name || ''
    },
    onBeforeOpen: async (modalElement) => {
      // Ajustar z-index para aparecer acima do modal de lista
      setTimeout(() => {
        modalElement.style.zIndex = '1056'
        const backdrops = document.querySelectorAll('.modal-backdrop')
        if (backdrops.length > 1) {
          backdrops[backdrops.length - 1].style.zIndex = '1055'
        }
      }, 10)
      
      const handleModalHidden = () => {
        modalElement.style.zIndex = ''
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden)
      }
      modalElement.addEventListener('hidden.bs.modal', handleModalHidden)
    }
  })
}

async function handleDeleteCategory(categoryId) {
  const category = await getCategoryById(categoryId)
  if (!category) {
    showToast('Categoria não encontrada.')
    return
  }

  const categoryName = category.name || 'N/A'
  
  openConfirmModal({
    modalId: 'deleteCategoryModal',
    messageId: 'deleteCategoryMessage',
    confirmButtonId: 'confirmDeleteCategoryBtn',
    message: `Tem certeza que deseja excluir a categoria "${categoryName}"?`,
    buttonTexts: { default: 'Excluir', loading: 'Excluindo...' },
    zIndex: 1057,
    onConfirm: async (modal) => {
      const result = await deleteCategory(categoryId)
      
      if (result?.success) {
        modal.hide()
        await refreshCategoriesTable()
        showToast(`Categoria "${categoryName}" excluída com sucesso!`)
      } else {
        throw new Error(result?.error || 'Erro ao excluir categoria')
      }
    }
  })
}

document.addEventListener('DOMContentLoaded', initDashboard)
