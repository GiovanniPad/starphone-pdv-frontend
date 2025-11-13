import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Toast from 'bootstrap/js/dist/toast'
import Modal from 'bootstrap/js/dist/modal'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR')

const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro 256GB',
    category: 'Smartphones',
    quantity: 12,
    saleValue: 10499,
    costValue: 8999
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 128GB',
    category: 'Smartphones',
    quantity: 18,
    saleValue: 6799,
    costValue: 5120
  },
  {
    id: 3,
    name: 'Fone Bluetooth JBL Tune 520BT',
    category: 'Acessórios',
    quantity: 56,
    saleValue: 449,
    costValue: 275
  },
  {
    id: 4,
    name: 'Capa Silicone Transparente',
    category: 'Acessórios',
    quantity: 140,
    saleValue: 79,
    costValue: 28
  },
  {
    id: 5,
    name: 'Relógio Xiaomi Watch 2 Lite',
    category: 'Wearables',
    quantity: 24,
    saleValue: 699,
    costValue: 455
  },
  {
    id: 6,
    name: 'Carregador USB-C 30W',
    category: 'Acessórios',
    quantity: 88,
    saleValue: 199,
    costValue: 112
  },
  {
    id: 7,
    name: 'Notebook Dell Inspiron 15',
    category: 'Notebooks',
    quantity: 9,
    saleValue: 4299,
    costValue: 3480
  },
  {
    id: 8,
    name: 'Película de Vidro Premium',
    category: 'Acessórios',
    quantity: 210,
    saleValue: 49,
    costValue: 15
  }
]

let filteredProducts = [...mockProducts]
let employees = []
let filteredEmployees = []

// Função para ordenar funcionários alfabeticamente por nome
function sortEmployeesAlphabetically(employeesList) {
  return [...employeesList].sort((a, b) => {
    const nameA = (a.fullname || '').toLowerCase().trim()
    const nameB = (b.fullname || '').toLowerCase().trim()
    return nameA.localeCompare(nameB, 'pt-BR')
  })
}

// Função para filtrar funcionários por busca
function filterEmployeesBySearch(employeesList, searchValue) {
  if (!searchValue || searchValue.trim() === '') {
    return [...employeesList]
  }
  
  const value = searchValue.toLowerCase()
  return sortEmployeesAlphabetically(employeesList.filter((employee) => {
    const fullName = employee.fullname || ''
    const email = employee.email || ''
    return (
      fullName.toLowerCase().includes(value) ||
      email.toLowerCase().includes(value)
    )
  }))
}

async function initDashboard() {
  // Aguardar um pouco para garantir que o preload terminou de carregar
  await new Promise(resolve => setTimeout(resolve, 200))
  
  renderSummary()
  renderProductTable()
  await loadEmployees()
  bindEvents()
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
      employees = sortEmployeesAlphabetically(Array.isArray(result.data) ? result.data : [])
      
      // Reaplicar o filtro de busca se houver um valor
      if (searchValue.trim() !== '') {
        filteredEmployees = filterEmployeesBySearch(employees, searchValue)
      } else {
        filteredEmployees = [...employees]
      }
      
      renderEmployeeTable()
    } else {
      throw new Error(result?.error || 'Erro ao carregar funcionários')
    }
  } catch (error) {
    showToast(`Erro: ${error.message || 'Erro ao carregar funcionários'}`)
    employees = []
    filteredEmployees = []
    renderEmployeeTable()
  }
}

function renderSummary() {
  const summaryContainer = document.getElementById('summaryCards')
  if (!summaryContainer) {
    return
  }

  const totalProducts = filteredProducts.length
  const totalUnits = filteredProducts.reduce((sum, product) => sum + (product.quantity ?? 0), 0)
  const totalRevenue = filteredProducts.reduce(
    (sum, product) => sum + product.saleValue * (product.quantity ?? 0),
    0
  )
  const totalCost = filteredProducts.reduce(
    (sum, product) => sum + product.costValue * (product.quantity ?? 0),
    0
  )
  const totalProfit = totalRevenue - totalCost
  const profitMargin = totalRevenue === 0 ? 0 : (totalProfit / totalRevenue) * 100

  const summaryItems = [
    {
      id: 'inventory',
      label: 'Itens cadastrados',
      value: `${totalProducts}`,
      helper: `${totalUnits} unidades em estoque`
    },
    {
      id: 'profit',
      label: 'Receita potencial',
      value: currencyFormatter.format(totalRevenue),
      helper: 'Somatório dos preços de venda'
    },
    {
      id: 'cost',
      label: 'Custo total',
      value: currencyFormatter.format(totalCost),
      helper: 'Investimento estimado em estoque'
    },
    {
      id: 'margin',
      label: 'Margem estimada',
      value: `${profitMargin.toFixed(1)}%`,
      helper: currencyFormatter.format(totalProfit) + ' de lucro'
    }
  ]

  summaryContainer.innerHTML = summaryItems
    .map(
      (item) => `
        <article class="col-12 col-md-6 col-xl-3">
          <div class="summary-card card" data-type="${item.id}">
            <div class="d-flex align-items-center gap-3">
              <span class="summary-icon">${getSummaryIcon(item.id)}</span>
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

function getSummaryIcon(type) {
  const iconMap = {
    inventory: '📦',
    profit: '💰',
    cost: '🧾',
    margin: '📈'
  }
  return iconMap[type] ?? 'ℹ️'
}

function renderProductTable() {
  const tableBody = document.getElementById('productTableBody')
  if (!tableBody) {
    return
  }

  if (filteredProducts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          Nenhum produto encontrado com os filtros atuais.
        </td>
      </tr>
    `
    return
  }

  tableBody.innerHTML = filteredProducts
    .map((product) => {
      const quantity = product.quantity ?? 0
      const profitPerUnit = product.saleValue - product.costValue
      const profitClass = profitPerUnit >= 0 ? 'text-success' : 'text-danger'
      return `
        <tr data-product-id="${product.id}">
          <td>
            <div class="fw-semibold">${product.name}</div>
            <div class="text-muted small">ID #${product.id}</div>
          </td>
          <td>
            <span class="badge bg-light text-dark">${product.category}</span>
          </td>
          <td class="text-end fw-semibold">${quantity}</td>
          <td class="text-end fw-semibold">${currencyFormatter.format(product.saleValue)}</td>
          <td class="text-end">${currencyFormatter.format(product.costValue)}</td>
          <td class="text-end ${profitClass} fw-semibold">${currencyFormatter.format(profitPerUnit)}</td>
          <td class="text-end">
            <div class="action-buttons">
              <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                data-action="edit"
                data-product-id="${product.id}"
              >
                Editar
              </button>
              <button
                type="button"
                class="btn btn-outline-danger btn-sm"
                data-action="delete"
                data-product-id="${product.id}"
              >
                Excluir
              </button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')
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
      const adminBadgeClass = isAdmin ? 'bg-success-subtle text-success-emphasis' : 'bg-light text-dark'
      const adminLabel = isAdmin ? 'Admin' : 'Usuário'
      const isActive = employee.active !== undefined ? employee.active : true
      const activeBadgeClass = isActive ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'
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
              >
                Editar
              </button>
              <button
                type="button"
                class="btn ${isActive ? 'btn-outline-danger' : 'btn-outline-success'} btn-sm"
                data-action="delete"
                data-entity="employee"
                data-employee-id="${employee.id}"
              >
                ${isActive ? 'Inativar' : 'Reativar'}
              </button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')
}

function bindEvents() {
  const searchInput = document.getElementById('searchProduct')
  const refreshButton = document.getElementById('refreshDashboard')
  const addProductButton = document.getElementById('addProductBtn')
  const productTable = document.getElementById('productTableBody')
  const employeeSearchInput = document.getElementById('searchEmployee')
  const addEmployeeButton = document.getElementById('addEmployeeBtn')
  const employeeTable = document.getElementById('employeeTableBody')

  searchInput?.addEventListener('input', (event) => {
    const value = event.target.value.toLowerCase()
    filteredProducts = mockProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(value) ||
        product.category.toLowerCase().includes(value)
      )
    })

    renderSummary()
    renderProductTable()
  })

  refreshButton?.addEventListener('click', () => {
    const search = document.getElementById('searchProduct')
    if (search) {
      search.value = ''
    }
    filteredProducts = [...mockProducts]
    renderSummary()
    renderProductTable()
    showToast('Dados atualizados com sucesso!')
  })

  addProductButton?.addEventListener('click', () => {
    showToast('Funcionalidade de cadastro em desenvolvimento.')
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
    const product = mockProducts.find((item) => item.id === productId)
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
      
      const modalElement = document.getElementById('employeeModal')
      const modal = Modal.getInstance(modalElement)
      modal?.hide()

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
}

function handleEditProduct(product) {
  showToast(`Editar produto: ${product.name}`)
}

function handleDeleteProduct(product) {
  // No futuro poderemos pedir confirmação e chamar a API.
  showToast(`Excluir produto: ${product.name}`)
}

function openEmployeeModal(mode, employee = null) {
  const modalElement = document.getElementById('employeeModal')
  if (!modalElement) {
    showToast('Erro: Modal de funcionário não encontrado.')
    return
  }

  const modal = new Modal(modalElement)
  const isEditMode = mode === 'edit'
  
  // Atualizar título do modal
  const modalTitle = document.getElementById('employeeModalLabel')
  const submitButton = document.getElementById('employeeSubmitButton')
  const passwordInput = document.getElementById('employeePassword')
  const passwordHelp = document.getElementById('employeePasswordHelp')
  const hiringDateContainer = document.getElementById('employeeHiringDateContainer')
  const resignationDateContainer = document.getElementById('employeeResignationDateContainer')
  
  if (modalTitle) {
    modalTitle.textContent = isEditMode ? 'Editar Funcionário' : 'Novo Funcionário'
  }
  if (submitButton) {
    submitButton.textContent = isEditMode ? 'Salvar alterações' : 'Criar funcionário'
  }
  if (passwordInput) {
    passwordInput.placeholder = isEditMode 
      ? 'Deixe em branco para não alterar' 
      : 'Digite a senha do funcionário'
    // Limpar validação customizada
    passwordInput.setCustomValidity('')
    // Remover required se estiver em modo de edição
    if (isEditMode) {
      passwordInput.removeAttribute('required')
      passwordInput.removeAttribute('minlength')
    } else {
      passwordInput.setAttribute('required', 'required')
      passwordInput.setAttribute('minlength', '6')
    }
  }
  if (passwordHelp) {
    passwordHelp.textContent = isEditMode
      ? 'Deixe em branco se não desejar alterar a senha.'
      : 'A senha é obrigatória para criar um novo funcionário.'
  }
  
  // Mostrar/ocultar campos de data
  if (hiringDateContainer) {
    hiringDateContainer.style.display = isEditMode ? 'block' : 'none'
  }
  if (resignationDateContainer) {
    resignationDateContainer.style.display = isEditMode ? 'block' : 'none'
  }
  
  // Preencher os campos do formulário
  document.getElementById('employeeMode').value = mode
  document.getElementById('employeeId').value = employee?.id || ''
  document.getElementById('employeeOriginalEmail').value = employee?.email || ''
  document.getElementById('employeeFullname').value = employee?.fullname || ''
  document.getElementById('employeeEmail').value = employee?.email || ''
  document.getElementById('employeeSalary').value = employee?.salary || 0
  document.getElementById('employeePassword').value = ''
  
  if (isEditMode && employee) {
    // Preencher datas (formatar para input date: YYYY-MM-DD)
    const hiringDate = employee.hiring_date 
      ? formatDateForInput(employee.hiring_date) 
      : ''
    const resignationDate = employee.resignation_date 
      ? formatDateForInput(employee.resignation_date) 
      : ''
    
    document.getElementById('employeeHiringDate').value = hiringDate
    document.getElementById('employeeResignationDate').value = resignationDate
    
    // Preencher checkbox de administrador
    document.getElementById('employeeAdmin').checked = employee.admin || false
  } else {
    // Modo criação: limpar campos
    document.getElementById('employeeHiringDate').value = ''
    document.getElementById('employeeResignationDate').value = ''
    document.getElementById('employeeAdmin').checked = false
  }
  
  // Limpar validação anterior
  const form = document.getElementById('employeeForm')
  form.classList.remove('was-validated')
  
  // Abrir o modal
  modal.show()
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

document.addEventListener('DOMContentLoaded', initDashboard)
