import { BrowserWindow, app, ipcMain, dialog } from 'electron'
import isDev from 'electron-is-dev'
import * as fs from 'fs'
import { join } from 'path'

import * as csv from 'csv'
import reload from 'electron-reload'

import { convertToCsvData } from './functions'

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
  myIpcMain.handle('saveFile', async (_event, data) => {
    const path = dialog.showSaveDialogSync(window, {
      buttonLabel: 'Save',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      properties: ['createDirectory'],
    })

    if (path === undefined) {
      return { success: false, error: 'Cancel' } as const
    }
    const csvData = convertToCsvData(data)
    let errorMessage = ''
    try {
      csv.stringify(csvData, { header: true }, (error, output) => {
        errorMessage = error ? error.message : ''
        fs.writeFileSync(path, output)
      })
      if (errorMessage.length === 0) return { success: true, path: path } as const
      return { success: false, error: errorMessage } as const
    } catch (error) {
      if (error instanceof Error) return { success: false, error: error.message } as const
      return { success: false, error: 'Unknown Error' } as const
    }
  })
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// ipcMain.handle('data', async (_event: IpcMainInvokeEvent, path, query) => {
//   // event.sender.send('data', data)
//   const resolvedPath = resolvePath(path, '共有ドライブ', 'Shared drives')
//   if (resolvedPath) {
//     const data = await readDbSync(resolvedPath, query)
//     return data
//   }
//   return null
// })

// ipcMain.on('message', (event: IpcMainEvent, data: any) => {
//   console.log(data)
//   setTimeout(() => event.sender.send('message', 'hi from electron'), 500)
// })
