import { ipcRenderer, contextBridge } from 'electron'

import { getSettings, getData } from './functions'

import type { Main, MyIpcChannelDataType, MyIpcChannelType } from '../types'

const myIpcRenderer = {
  invoke: async <T extends MyIpcChannelType>(
    channel: T,
    args?: Parameters<MyIpcChannelDataType[T]>[0]
  ): Promise<Awaited<ReturnType<MyIpcChannelDataType[T]>>> => ipcRenderer.invoke(channel, args),
}

export const api: Main = {
  getSettings: () => getSettings(),
  getData: (request) => getData(request),
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
  saveFile: (data) => myIpcRenderer.invoke('saveFile', data),
  isMaximize: () => myIpcRenderer.invoke('isMaximize'),
  // sendMessage: (message) => ipcRenderer.send('message', message),
  // on: (channel: string, callback: (data: any) => void) => {
  //   ipcRenderer.on(channel, (_, data) => callback(data))
  // },
}

contextBridge.exposeInMainWorld('Main', api)
