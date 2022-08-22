import { BrowserWindow, app, ipcMain, dialog } from 'electron'
import isDev from 'electron-is-dev'
import { join } from 'path'

import reload from 'electron-reload'

import type { MyIpcChannelDataType, MyIpcChannelType } from '../types'
import type { IpcMainInvokeEvent } from 'electron'

const myIpcMain = {
  handle: <T extends MyIpcChannelType>(
    channel: T,
    listener: (
      event: IpcMainInvokeEvent,
      args: Parameters<MyIpcChannelDataType[T]>[0]
    ) => Promise<Awaited<ReturnType<MyIpcChannelDataType[T]>>>
  ) => ipcMain.handle(channel, listener),
}

if (isDev) {
  reload(__dirname, {
    electron: join(__dirname, '../../node_modules/electron/dist/electron.exe'),
  })
}

const createWindow = () => {
  // Create the browser window.
  const window = new BrowserWindow({
    //  change to false to use AppBar
    frame: false,
    show: false,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  })
  window.maximize()
  window.show()

  const port = process.env.PORT || 3000
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../../src/out/index.html')

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url)
  } else {
    window?.loadFile(url)
  }
  // Open the DevTools.
  // window.webContents.openDevTools();

  // For AppBar
  myIpcMain.handle('Minimize', async () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMinimized() ? window.restore() : window.minimize()
    // or alternatively: win.isVisible() ? win.hide() : win.show()
  })
  myIpcMain.handle('Maximize', async () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMaximized() ? window.restore() : window.maximize()
  })

  myIpcMain.handle('Close', async () => {
    window.close()
  })

  myIpcMain.handle('openFileDialog', () =>
    dialog
      .showOpenDialog(window, {
        properties: ['openFile'],
      })
      .then((result) => {
        if (result.canceled) return ''
        return result.filePaths[0]
      })
  )

  myIpcMain.handle('isMaximize', async () => window.isMaximized())
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
