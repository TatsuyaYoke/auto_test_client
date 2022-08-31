import { exec } from 'child_process'
import { ipcRenderer, contextBridge } from 'electron'

import { getSettings } from './functions'

import type { Main, MyIpcChannelDataType, MyIpcChannelType } from '../types'

const myIpcRenderer = {
  invoke: async <T extends MyIpcChannelType>(
    channel: T,
    args?: Parameters<MyIpcChannelDataType[T]>[0]
  ): Promise<Awaited<ReturnType<MyIpcChannelDataType[T]>>> => ipcRenderer.invoke(channel, args),
}

export const api: Main = {
  Minimize: () => {
    myIpcRenderer.invoke('Minimize')
  },
  Maximize: () => {
    myIpcRenderer.invoke('Maximize')
  },
  Close: () => {
    myIpcRenderer.invoke('Close')
  },
  openFileDialog: () => myIpcRenderer.invoke('openFileDialog'),
  isMaximize: () => myIpcRenderer.invoke('isMaximize'),
  saveCsv: (data) => myIpcRenderer.invoke('saveCsv', data),
  getSettings: () => getSettings(),
  startApi: (apiPath) => {
    if (apiPath) {
      exec(apiPath)
      return true
    }
    return false
  },
  stopApi: (pidList: number[]) => {
    if (pidList.length === 0) return
    pidList.forEach((pid) => {
      try {
        process.kill(pid)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    })
  },
}

contextBridge.exposeInMainWorld('Main', api)
