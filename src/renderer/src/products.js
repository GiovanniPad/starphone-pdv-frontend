import { sortAlphabetically } from './utils.js'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

let products = []
let filteredProducts = []

/**
 * Extrai o nome da categoria do produto
 * @param {Object} product - Produto
 * @returns {string}
 */
function getCategoryName(product) {
  return product.category?.name || 'N/A'
}

/**
 * Carrega produtos da API
 * @returns {Promise<void>}
 */
export async function loadProducts() {
  // Salvar o valor atual do campo de busca antes de recarregar
  const productSearchInput = document.getElementById('searchProduct')
  const searchValue = productSearchInput?.value || ''
  
  const tableBody = document.getElementById('productTableBody')
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
          Carregando produtos...
        </td>
      </tr>
    `
  }

  try {
    if (!window.api?.getProducts) {
      throw new Error('API não disponível')
    }

    const result = await window.api.getProducts()
    
    if (result?.success && result.data) {
      products = sortAlphabetically(Array.isArray(result.data) ? result.data : [], 'name')
      
      // Reaplicar o filtro de busca se houver um valor
      if (searchValue.trim() !== '') {
        filteredProducts = filterProductsBySearch(products, searchValue)
      } else {
        filteredProducts = [...products]
      }
      
      renderProductTable()
      renderSummary()
    } else {
      throw new Error(result?.error || 'Erro ao carregar produtos')
    }
  } catch (error) {
    showToast(`Erro: ${error.message || 'Erro ao carregar produtos'}`)
    products = []
    filteredProducts = []
    renderProductTable()
  }
}

/**
 * Filtra produtos por busca
 * @param {Array} productsList - Lista de produtos
 * @param {string} searchValue - Valor da busca
 * @returns {Array}
 */
export function filterProductsBySearch(productsList, searchValue) {
  if (!searchValue || searchValue.trim() === '') {
    return sortAlphabetically([...productsList], 'name')
  }
  
  const value = searchValue.toLowerCase()
  const filtered = productsList.filter((product) => {
    const name = product.name || ''
    const category = getCategoryName(product)
    return (
      name.toLowerCase().includes(value) ||
      category.toLowerCase().includes(value)
    )
  })
  return sortAlphabetically(filtered, 'name')
}

/**
 * Renderiza a tabela de produtos
 */
export function renderProductTable() {
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
      const quantity = Number(product.quantity) || 0
      const costValue = Number(product.cost_value) || 0
      const profitValue = Number(product.profit_value) || 0
      const saleValue = costValue + profitValue
      const profitPerUnit = profitValue
      const profitClass = profitPerUnit >= 0 ? 'text-success' : 'text-danger'
      const categoryName = getCategoryName(product)
      return `
        <tr data-product-id="${product.id}">
          <td>
            <div class="fw-semibold">${product.name || 'N/A'}</div>
            <div class="text-muted small">ID #${product.id}</div>
          </td>
          <td>
            <span class="badge bg-light text-dark">${categoryName}</span>
          </td>
          <td class="text-end fw-semibold">${quantity}</td>
          <td class="text-end fw-semibold">${currencyFormatter.format(saleValue)}</td>
          <td class="text-end">${currencyFormatter.format(costValue)}</td>
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

/**
 * Renderiza o resumo de produtos
 */
export function renderSummary() {
  const summaryContainer = document.getElementById('summaryCards')
  if (!summaryContainer) {
    return
  }

  const totalProducts = filteredProducts.length
  const totalUnits = filteredProducts.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0)
  const costValue = (product) => Number(product.cost_value) || 0
  const profitValue = (product) => Number(product.profit_value) || 0
  const saleValue = (product) => costValue(product) + profitValue(product)
  const totalRevenue = filteredProducts.reduce(
    (sum, product) => sum + saleValue(product) * (Number(product.quantity) || 0),
    0
  )
  const totalCost = filteredProducts.reduce(
    (sum, product) => sum + costValue(product) * (Number(product.quantity) || 0),
    0
  )
  const totalProfit = filteredProducts.reduce(
    (sum, product) => sum + profitValue(product) * (Number(product.quantity) || 0),
    0
  )
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

/**
 * Retorna o ícone do resumo baseado no tipo
 * @param {string} type - Tipo do resumo
 * @returns {string}
 */
function getSummaryIcon(type) {
  const iconMap = {
    inventory: '📦',
    profit: '💰',
    cost: '🧾',
    margin: '📈'
  }
  return iconMap[type] ?? 'ℹ️'
}

/**
 * Atualiza a lista filtrada de produtos
 * @param {Array} newFilteredProducts - Nova lista filtrada
 */
export function setFilteredProducts(newFilteredProducts) {
  filteredProducts = newFilteredProducts
}

/**
 * Retorna a lista de produtos filtrados
 * @returns {Array}
 */
export function getFilteredProducts() {
  return filteredProducts
}

/**
 * Retorna a lista de produtos
 * @returns {Array}
 */
export function getProducts() {
  return products
}

/**
 * Retorna um produto por ID
 * @param {number} productId - ID do produto
 * @returns {Object|null}
 */
export function getProductById(productId) {
  return products.find((item) => item.id === productId) || null
}

// Função auxiliar para mostrar toast (será importada do renderer.js ou definida aqui)
function showToast(message) {
  // Esta função será injetada pelo renderer.js
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast(message)
  } else {
    console.log('Toast:', message)
  }
}

