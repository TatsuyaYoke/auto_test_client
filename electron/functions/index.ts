import * as fs from 'fs'
import { join } from 'path'

import { appSettingsSchema } from '../../types'

import type { ApiReturnType, AppSettingsType } from '../../types'

export const resolvePath = (path: string, resolveName1: string, resolveName2: string): string | null => {
  if (fs.existsSync(path)) return path
  let resolvedPath = ''
  if (path.indexOf(resolveName1) !== -1) {
    resolvedPath = path.replace(resolveName1, resolveName2)
    if (fs.existsSync(resolvedPath)) return resolvedPath
  }
  if (path.indexOf(resolveName2) !== -1) {
    resolvedPath = path.replace(resolveName2, resolveName1)
    if (fs.existsSync(resolvedPath)) return resolvedPath
  }
  return null
}

export const resolvePathGDrive = (path: string): string | null => resolvePath(path, '共有ドライブ', 'Shared drives')

const TOP_PATH_STR = 'G:/Shared drives/0705_Sat_Dev_Tlm'
const TOP_PATH = resolvePathGDrive(TOP_PATH_STR)
const SETTING_PATH = resolvePathGDrive(join(TOP_PATH_STR, 'settings/auto-test.json'))

export const getSettings = (): ApiReturnType<AppSettingsType> => {
  if (!TOP_PATH) return { success: false, error: 'Cannot connect GDrive' } as const
  if (!SETTING_PATH) return { success: false, error: 'Not found project setting file' } as const
  const settingsBeforeParse = JSON.parse(fs.readFileSync(SETTING_PATH, 'utf8'))
  const schemaResult = appSettingsSchema.safeParse(settingsBeforeParse)
  if (!schemaResult.success) return { success: false, error: 'Cannot parse project setting file correctly' } as const

  return {
    success: true,
    data: schemaResult.data,
  } as const
}
