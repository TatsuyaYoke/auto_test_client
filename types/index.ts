import * as z from 'zod'

export const nonNullable = <T>(item: T): item is NonNullable<T> => item != null
export const isNotString = <T>(item: T): item is Exclude<T, string> => typeof item !== 'string'
export const isNotNumber = <T>(item: T): item is Exclude<T, number> => typeof item !== 'number'

export type MyIpcChannelDataType = {
  Maximize: () => void
  Minimize: () => void
  Close: () => void
  openFileDialog: () => Promise<string | undefined>
  saveCsv: (data: ObjectArrayDataType) => Promise<{ success: true; path: string } | { success: false; error: string }>
  isMaximize: () => Promise<boolean>
}
export type MyIpcChannelType = keyof MyIpcChannelDataType

export type Main = MyIpcChannelDataType & {
  getSettings: () => ApiReturnType<AppSettingsType>
  startApi: (apiPath?: string) => boolean
  stopApi: (pidList: number[]) => void
}

declare global {
  interface Window {
    Main: Main
  }
}

export type SelectOptionType = {
  label: string
  value: string
}

export const pjNameSchema = z.string().regex(/^DSX[0-9]{4}/)
export const savePathSchema = z.string()

export const pjSettingSchema = z.object({
  pjName: pjNameSchema,
  savePath: savePathSchema,
})
export const pjSettingsSchema = z.array(pjSettingSchema)

export const commonSettingSchema = z.object({
  saveDirPath: z.string(),
  apiPath: z.string(),
  apiUrl: z.string(),
  waitSecApiStartup: z.number(),
})

export const appSettingsSchema = z.object({
  common: commonSettingSchema,
  project: pjSettingsSchema,
})

export type PjSettingType = z.infer<typeof pjSettingSchema>
export type PjSettingsType = z.infer<typeof pjSettingsSchema>
export type PjSettingsKeyType = keyof PjSettingType
export type AppSettingsType = z.infer<typeof appSettingsSchema>

export type QuerySuccess<T> = { success: true; data: T }
export type QueryError = { success: false; error: string }
export type QueryReturnType<T> = QuerySuccess<T> | QueryError
export type ApiReturnType<T> = QueryReturnType<T>

const errorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

export const getPidSchema = z.union([
  z.object({
    success: z.literal(true),
    data: z.array(z.number()),
  }),
  errorSchema,
])

export const connectSchema = z.union([
  z.object({
    success: z.literal(true),
    isOpen: z.boolean(),
  }),
  errorSchema,
])

export type ConnectParamsType = {
  accessPoint: string
}

export const apiNoDataSchema = z.union([
  z.object({
    success: z.literal(true),
  }),
  errorSchema,
])

export const apiDataStringSchema = z.union([
  z.object({
    success: z.literal(true),
    data: z.string(),
  }),
  errorSchema,
])

export type StartObsParamsType = {
  testName: string
  obsDuration: number
  warmUpDuration: number
  holdDuration: number
}

export const startObsReturnSchema = z.union([
  z.object({
    success: z.literal(true),
    data: z.object({
      time: z.array(z.number()),
      power: z.array(z.number()),
    }),
  }),
  errorSchema,
])

export type PowerSensorDataType = {
  time: number[]
  power: number[]
}

export type GraphDataType = {
  name: string
  x: (number | string)[]
  y: (number | null)[]
}

export type DataType = number | string | null
export type ObjectDataType = {
  [key: string]: DataType
}
export type ArrayObjectDataType = ObjectDataType[]
export type ObjectArrayDataType = {
  [key: string]: DataType[]
}

export type TransRecordStartParamsType = {
  sessionName: string
  duration: number
}

export type TransProcessingParamsType = {
  sessionName: string
  pathStr: string
  pathScriptStr: string
}

export type TransGetDataParamsType = {
  sessionName: string
  pathStr: string
  deleteFlag: boolean
}
