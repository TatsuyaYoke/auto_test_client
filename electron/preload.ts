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
  getSettings: () => getSettings(),
  startApi: () => {
    exec('C:/Users/81809/src/git/sat_auto/sat_auto_test_api/sat_auto_test_api.sh')
  },
}

contextBridge.exposeInMainWorld('Main', api)
