import { sortAlphabetically } from './utils.js'

/**
 * Carrega categorias da API
 * @returns {Promise<Array>}
 */
export async function loadCategories() {
  try {
    if (!window.api?.getCategories) {
      throw new Error('API não disponível')
    }

    const result = await window.api.getCategories()
    
    if (result?.success && result.data) {
      return sortAlphabetically(Array.isArray(result.data) ? result.data : [], 'name')
    } else {
      throw new Error(result?.error || 'Erro ao carregar categorias')
    }
  } catch (error) {
    if (window.showToast) {
      window.showToast(`Erro: ${error.message || 'Erro ao carregar categorias'}`)
    }
    return []
  }
}

/**
 * Renderiza a tabela de categorias no modal
 * @param {Array} categories - Lista de categorias
 */
export function renderCategoriesTable(categories) {
  const tableBody = document.getElementById('categoriesTableBody')
  if (!tableBody) {
    return
  }

  if (categories.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-muted py-4">
          Nenhuma categoria encontrada.
        </td>
      </tr>
    `
    return
  }

  // Garantir que as categorias estejam ordenadas
  const sortedCategories = sortAlphabetically(categories, 'name')

  tableBody.innerHTML = sortedCategories
    .map((category) => {
      const id = category.id || 'N/A'
      const name = category.name || 'N/A'
      return `
        <tr data-category-id="${id}">
          <td>
            <div class="fw-semibold">${name}</div>
            <div class="text-muted small">ID #${id}</div>
          </td>
          <td class="text-end">
            <div class="action-buttons">
              <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                data-action="edit"
                data-category-id="${id}"
                title="Editar categoria"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
              </button>
              <button
                type="button"
                class="btn btn-outline-danger btn-sm"
                data-action="delete"
                data-category-id="${id}"
                title="Excluir categoria"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H11a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')
}

/**
 * Carrega uma categoria por ID
 * @param {number} categoryId - ID da categoria
 * @returns {Promise<Object|null>}
 */
export async function getCategoryById(categoryId) {
  try {
    if (!window.api?.getCategories) {
      throw new Error('API não disponível')
    }

    const result = await window.api.getCategories()
    
    if (result?.success && result.data) {
      const categories = Array.isArray(result.data) ? result.data : []
      return categories.find(cat => cat.id === categoryId) || null
    }
    return null
  } catch (error) {
    if (window.showToast) {
      window.showToast(`Erro: ${error.message || 'Erro ao buscar categoria'}`)
    }
    return null
  }
}

/**
 * Cria uma nova categoria
 * @param {Object} categoryData - Dados da categoria
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createCategory(categoryData) {
  try {
    if (!window.api?.createCategory) {
      throw new Error('API não disponível')
    }

    const result = await window.api.createCategory(categoryData)
    
    if (result?.success) {
      return { success: true }
    } else {
      throw new Error(result?.error || 'Erro ao criar categoria')
    }
  } catch (error) {
    if (window.showToast) {
      window.showToast(`Erro: ${error.message || 'Erro ao criar categoria'}`)
    }
    return { success: false, error: error.message }
  }
}

/**
 * Atualiza uma categoria
 * @param {number} categoryId - ID da categoria
 * @param {Object} categoryData - Dados da categoria
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateCategory(categoryId, categoryData) {
  try {
    if (!window.api?.updateCategory) {
      throw new Error('API não disponível')
    }

    const result = await window.api.updateCategory(categoryId, categoryData)
    
    if (result?.success) {
      return { success: true }
    } else {
      throw new Error(result?.error || 'Erro ao atualizar categoria')
    }
  } catch (error) {
    if (window.showToast) {
      window.showToast(`Erro: ${error.message || 'Erro ao atualizar categoria'}`)
    }
    return { success: false, error: error.message }
  }
}

/**
 * Deleta uma categoria
 * @param {number} categoryId - ID da categoria
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCategory(categoryId) {
  try {
    if (!window.api?.deleteCategory) {
      throw new Error('API não disponível')
    }

    const result = await window.api.deleteCategory(categoryId)
    
    if (result?.success) {
      return { success: true }
    } else {
      throw new Error(result?.error || 'Erro ao excluir categoria')
    }
  } catch (error) {
    // Não mostrar toast aqui para evitar duplicação
    // O erro será tratado no renderer.js
    return { success: false, error: error.message }
  }
}

