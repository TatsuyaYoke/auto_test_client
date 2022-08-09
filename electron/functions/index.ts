import * as fs from 'fs'
import { join } from 'path'

import glob from 'glob'

import { appSettingsSchema, tlmIdSchema, tlmStSchema } from '../../types'
import { compare } from './common'
import { MAX_TLM_LENGTH, TIMEOUT_MS } from './getDbDataCommon'
import { getGroundData } from './getGroundData'
import { getOrbitData } from './getOrbitData'

import type { PjSettingWithTlmIdType, ResponseDataType, CsvDataType, RequestDataType, ApiReturnType } from '../../types'

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
const BIGQUERY_SETTING_PATH = resolvePathGDrive(join(TOP_PATH_STR, 'settings/strix-tlm-bq-reader-service-account.json'))
const PROJECT_SETTING_PATH = resolvePathGDrive(join(TOP_PATH_STR, 'settings/pj-settings.json'))

export const getSettings = (): ApiReturnType<PjSettingWithTlmIdType[]> => {
  if (!TOP_PATH) return { success: false, error: 'Cannot connect GDrive' } as const
  if (!PROJECT_SETTING_PATH) return { success: false, error: 'Not found project setting file' } as const
  const settingsBeforeParse = JSON.parse(fs.readFileSync(PROJECT_SETTING_PATH, 'utf8'))
  const schemaResult = appSettingsSchema.safeParse(settingsBeforeParse)
  if (!schemaResult.success) return { success: false, error: 'Cannot parse project setting file correctly' } as const

  const pjSettings = schemaResult.data.project
  const pjSettingWithTlmIdList = pjSettings.map((value) => {
    const tlmIdFilePath = resolvePathGDrive(join(TOP_PATH, 'settings', value.pjName, 'tlm_id.json'))
    const tlmStFilePath = resolvePathGDrive(join(TOP_PATH, 'settings', value.pjName, 'tlm_st.json'))
    const response: PjSettingWithTlmIdType = value
    if (tlmIdFilePath) {
      const tlmIdSettingsBeforeParse = JSON.parse(fs.readFileSync(tlmIdFilePath, 'utf-8'))
      const tlmIdSchemaResult = tlmIdSchema.safeParse(tlmIdSettingsBeforeParse)
      if (tlmIdSchemaResult.success) {
        response.tlmId = tlmIdSchemaResult.data
      }
      if (value.groundTestPath) {
        const testCaseDirs = glob.sync(join(TOP_PATH, value.groundTestPath, '*'))
        const testCaseList = testCaseDirs.map((dir: string) => dir.substring(dir.lastIndexOf('/') + 1))
        if (testCaseList.length !== 0) {
          response.testCase = testCaseList
        }
      }
    }
    if (tlmStFilePath) {
      const tlmStSettingsBeforeParse = JSON.parse(fs.readFileSync(tlmStFilePath, 'utf-8'))
      const tlmStSchemaResult = tlmStSchema.safeParse(tlmStSettingsBeforeParse)
      if (tlmStSchemaResult.success) {
        response.tlmSt = tlmStSchemaResult.data
      }
    }
    return response
  })
  return {
    success: true,
    data: pjSettingWithTlmIdList,
  } as const
}

export const convertToCsvData = (responseData: ResponseDataType['tlm']): CsvDataType[] => {
  const tlmNameList = Object.keys(responseData.data)
  const timeList = responseData.time
  const csvData = timeList.map((time, index) => {
    const returnData: CsvDataType = { Time: time }
    tlmNameList.forEach((tlmName) => {
      returnData[tlmName] = responseData.data[tlmName]?.[index] ?? null
    })
    return returnData
  })
  const sortedCsvData = csvData.sort((a, b) => compare(a.Time, b.Time, false))
  return sortedCsvData
}

const timeoutError = (timeoutMs: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve('Timeout'), timeoutMs)
  })

const isResponseDataType = (item: unknown): item is ResponseDataType => {
  if (
    (item as ResponseDataType).success !== undefined &&
    ((item as ResponseDataType).tlm !== undefined && (item as ResponseDataType).errorMessages) !== undefined
  )
    return true
  return false
}

export const getData = async (request: RequestDataType, timeoutMs = TIMEOUT_MS): Promise<ResponseDataType> => {
  let errorMessage = ''
  let result

  try {
    if (request.isOrbit) {
      result = await Promise.race([getOrbitData(request, BIGQUERY_SETTING_PATH), timeoutError(timeoutMs)])
    } else {
      result = await Promise.race([getGroundData(request, TOP_PATH), timeoutError(timeoutMs)])
    }
  } catch (error) {
    if (error instanceof Error) {
      errorMessage = error.message
    } else {
      errorMessage = 'Unknown Error'
    }
  }

  if (isResponseDataType(result)) {
    if (result.tlm.time.length < MAX_TLM_LENGTH) return result
    errorMessage = `Telemetry Length too long more than ${MAX_TLM_LENGTH}`
  }

  if (errorMessage.length === 0)
    errorMessage = 'Timeout Error, please reduce amount of data or wait for GDrive synchronization'
  return {
    success: false,
    tlm: {
      time: [],
      data: {},
    },
    errorMessages: [errorMessage],
  }
}
