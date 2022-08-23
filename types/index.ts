import * as z from 'zod'

export const nonNullable = <T>(item: T): item is NonNullable<T> => item != null
export const isNotString = <T>(item: T): item is Exclude<T, string> => typeof item !== 'string'
export const isNotNumber = <T>(item: T): item is Exclude<T, number> => typeof item !== 'number'

export type MyIpcChannelDataType = {
  Maximize: () => void
  Minimize: () => void
  Close: () => void
  openFileDialog: () => Promise<string | undefined>
  isMaximize: () => Promise<boolean>
}
export type MyIpcChannelType = keyof MyIpcChannelDataType

export type Main = MyIpcChannelDataType & {
  getSettings: () => ApiReturnType<AppSettingsType>
  startApi: () => boolean
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

export const apiPathListSchema = z.array(z.string())
export const commonSettingSchema = z.object({
  apiPathList: apiPathListSchema,
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
