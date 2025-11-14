import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getUsers: () => ipcRenderer.invoke('api:getUsers'),
  updateUser: (email, userData) => ipcRenderer.invoke('api:updateUser', email, userData),
  createUser: (userData) => ipcRenderer.invoke('api:createUser', userData),
  deactivateUser: (email) => ipcRenderer.invoke('api:deactivateUser', email),
  reactivateUser: (email) => ipcRenderer.invoke('api:reactivateUser', email),
  getProducts: () => ipcRenderer.invoke('api:getProducts'),
  getCategories: () => ipcRenderer.invoke('api:getCategories'),
  createCategory: (categoryData) => ipcRenderer.invoke('api:createCategory', categoryData),
  updateCategory: (categoryId, categoryData) => ipcRenderer.invoke('api:updateCategory', categoryId, categoryData),
  deleteCategory: (categoryId) => ipcRenderer.invoke('api:deleteCategory', categoryId)
}

try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error(error)
}
