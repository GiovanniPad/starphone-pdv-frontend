import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Toast from 'bootstrap/js/dist/toast'

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
const mockEmployees = [
  {
    id: 1,
    fullName: 'Giovana Costa',
    email: 'giovana.costa@starphone.com.br',
    salary: 4800,
    hireDate: '2021-03-15',
    terminationDate: null,
    isAdmin: true
  },
  {
    id: 2,
    fullName: 'Lucas Almeida',
    email: 'lucas.almeida@starphone.com.br',
    salary: 4200,
    hireDate: '2022-02-10',
    terminationDate: null,
    isAdmin: false
  },
  {
    id: 3,
    fullName: 'Mariana Ribeiro',
    email: 'mariana.ribeiro@starphone.com.br',
    salary: 3950,
    hireDate: '2019-08-01',
    terminationDate: '2024-10-18',
    isAdmin: false
  },
  {
    id: 4,
    fullName: 'Carlos Menezes',
    email: 'carlos.menezes@starphone.com.br',
    salary: 3650,
    hireDate: '2020-06-22',
    terminationDate: null,
    isAdmin: false
  }
]
let filteredEmployees = [...mockEmployees]

function initDashboard() {
  renderSummary()
  renderProductTable()
  renderEmployeeTable()
  bindEvents()
  updateFooterYear()
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
        <td colspan="7" class="text-center text-muted py-4">
          Nenhum funcionário encontrado com os filtros atuais.
        </td>
      </tr>
    `
    return
  }

  tableBody.innerHTML = filteredEmployees
    .map((employee) => {
      const hireDate = formatDate(employee.hireDate)
      const terminationDate = formatDate(employee.terminationDate)
      const adminBadgeClass = employee.isAdmin ? 'bg-success-subtle text-success-emphasis' : 'bg-light text-dark'
      const adminLabel = employee.isAdmin ? 'Admin' : 'Usuário'
      return `
        <tr data-employee-id="${employee.id}">
          <td>
            <div class="fw-semibold">${employee.fullName}</div>
            <div class="text-muted small">ID #${employee.id}</div>
          </td>
          <td>
            <a href="mailto:${employee.email}" class="text-decoration-none">${employee.email}</a>
          </td>
          <td class="text-end fw-semibold">${currencyFormatter.format(employee.salary)}</td>
          <td>${hireDate}</td>
          <td>${terminationDate}</td>
          <td class="text-center">
            <span class="badge ${adminBadgeClass}">${adminLabel}</span>
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
                class="btn btn-outline-danger btn-sm"
                data-action="delete"
                data-entity="employee"
                data-employee-id="${employee.id}"
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
    const value = event.target.value.toLowerCase()
    filteredEmployees = mockEmployees.filter((employee) => {
      return (
        employee.fullName.toLowerCase().includes(value) ||
        employee.email.toLowerCase().includes(value)
      )
    })
    renderEmployeeTable()
  })

  addEmployeeButton?.addEventListener('click', () => {
    showToast('Funcionalidade de cadastro de funcionário em desenvolvimento.')
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
    const employee = mockEmployees.find((item) => item.id === employeeId)
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
}

function handleEditProduct(product) {
  showToast(`Editar produto: ${product.name}`)
}

function handleDeleteProduct(product) {
  // No futuro poderemos pedir confirmação e chamar a API.
  showToast(`Excluir produto: ${product.name}`)
}

function handleEditEmployee(employee) {
  showToast(`Editar funcionário: ${employee.fullName}`)
}

function handleDeleteEmployee(employee) {
  showToast(`Excluir funcionário: ${employee.fullName}`)
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
