// URL base da API FastAPI
const API_BASE_URL = 'http://localhost:8000'

/**
 * Handler para buscar produtos da API
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/`)
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching products:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Handler para criar produto na API
 * @param {Object} productData - Dados do produto
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
      throw new Error(errorData.detail || `Erro ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating product:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Handler para atualizar produto na API
 * @param {number} productId - ID do produto
 * @param {Object} productData - Dados do produto
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateProduct(productId, productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
      throw new Error(errorData.detail || `Erro ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating product:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Handler para deletar produto na API
 * @param {number} productId - ID do produto
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
      throw new Error(errorData.detail || `Erro ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Handler para buscar categorias da API
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/`)
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching categories:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Handler para criar categoria na API
 * @param {Object} categoryData - Dados da categoria
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCategory(categoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
      throw new Error(errorData.detail || `Erro ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating category:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Handler para atualizar categoria na API
 * @param {number} categoryId - ID da categoria
 * @param {Object} categoryData - Dados da categoria
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCategory(categoryId, categoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
      throw new Error(errorData.detail || `Erro ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating category:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Handler para deletar categoria na API
 * @param {number} categoryId - ID da categoria
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCategory(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
      throw new Error(errorData.detail || `Erro ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Registra os handlers IPC para produtos
 * @param {import('electron').IpcMain} ipcMain - Instância do ipcMain do Electron
 */
export function registerProductHandlers(ipcMain) {
  ipcMain.handle('api:getProducts', async () => {
    return await getProducts()
  })
  
  ipcMain.handle('api:createProduct', async (_, productData) => {
    return await createProduct(productData)
  })
  
  ipcMain.handle('api:updateProduct', async (_, productId, productData) => {
    return await updateProduct(productId, productData)
  })
  
  ipcMain.handle('api:deleteProduct', async (_, productId) => {
    return await deleteProduct(productId)
  })
  
  ipcMain.handle('api:getCategories', async () => {
    return await getCategories()
  })
  
  ipcMain.handle('api:createCategory', async (_, categoryData) => {
    return await createCategory(categoryData)
  })
  
  ipcMain.handle('api:updateCategory', async (_, categoryId, categoryData) => {
    return await updateCategory(categoryId, categoryData)
  })
  
  ipcMain.handle('api:deleteCategory', async (_, categoryId) => {
    return await deleteCategory(categoryId)
  })
}

