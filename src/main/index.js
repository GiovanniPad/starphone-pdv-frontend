import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// URL base da API FastAPI
const API_BASE_URL = 'http://localhost:8000'

function createWindow() {
  // Create the browser window.
  const preloadPath = join(__dirname, '../preload/index.js')
  
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // API handlers - FastAPI
  ipcMain.handle('api:getUsers', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching users:', error.message)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('api:updateUser', async (_, email, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
        throw new Error(errorData.detail || `Erro ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error updating user:', error.message)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('api:createUser', async (_, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
        throw new Error(errorData.detail || `Erro ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error creating user:', error.message)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('api:deactivateUser', async (_, email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}/deactivate/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
        throw new Error(errorData.detail || `Erro ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error deactivating user:', error.message)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('api:reactivateUser', async (_, email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}/reactivate/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status}` }))
        throw new Error(errorData.detail || `Erro ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error reactivating user:', error.message)
      return { success: false, error: error.message }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
