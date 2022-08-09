import * as z from 'zod'

import type { MultiValue } from 'chakra-react-select'

export const nonNullable = <T>(item: T): item is NonNullable<T> => item != null
export const isNotString = <T>(item: T): item is Exclude<T, string> => typeof item !== 'string'
export const isNotNumber = <T>(item: T): item is Exclude<T, number> => typeof item !== 'number'

export type MyIpcChannelDataType = {
  Maximize: () => void
  Minimize: () => void
  Close: () => void
  openFileDialog: () => Promise<string | undefined>
  saveFile: (
    data: ResponseDataType['tlm']
  ) => Promise<{ success: true; path: string } | { success: false; error: string }>
  isMaximize: () => Promise<boolean>
  // sendMessage: (message: string) => void
  // on: (channel: string, callback: (data: any) => void) => void
}
export type MyIpcChannelType = keyof MyIpcChannelDataType

export type Main = MyIpcChannelDataType & {
  getData: (request: RequestDataType) => Promise<ResponseDataType>
  getSettings: () => ApiReturnType<PjSettingWithTlmIdType[]>
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

export type TlmListType = {
  id: number
  tlm: MultiValue<SelectOptionType>
}

export type SavedTlmListType = {
  tlmListName: SelectOptionType
  tlm: MultiValue<SelectOptionType>[]
}

export const pjNameSchema = z.string().regex(/^DSX[0-9]{4}/)
export const groundTestPathSchema = z.string()
export const orbitDatasetPathSchema = z.string().regex(/^strix_/)

export const pjSettingSchema = z.union([
  z.object({
    pjName: pjNameSchema,
    groundTestPath: groundTestPathSchema.optional(),
    orbitDatasetPath: orbitDatasetPathSchema,
  }),
  z.object({
    pjName: pjNameSchema,
    groundTestPath: groundTestPathSchema,
    orbitDatasetPath: orbitDatasetPathSchema.optional(),
  }),
])
export const pjSettingsSchema = z.array(pjSettingSchema)
export const appSettingsSchema = z.object({
  project: pjSettingsSchema,
})

export type PjSettingType = z.infer<typeof pjSettingSchema>
export type PjSettingsType = z.infer<typeof pjSettingsSchema>
export type PjSettingsKeyType = keyof PjSettingType
export type AppSettingsType = z.infer<typeof appSettingsSchema>

export const tlmIdSchema = z.record(z.number())
export type TlmIdType = z.infer<typeof tlmIdSchema>
export const tlmStSchema = z.record(
  z.object({
    value: z.array(z.number()),
    text: z.array(z.string()),
  })
)
export type TlmStType = z.infer<typeof tlmStSchema>
export type PjSettingWithTlmIdType = PjSettingType & {
  tlmId?: TlmIdType
  testCase?: string[]
  tlmSt?: TlmStType
}

export type DateSettingType = {
  startDate: Date
  endDate: Date
}
export type RequestTlmType = {
  tlmId: number
  tlmList: string[]
}
export type RequestDataType = {
  isOrbit: boolean
  isStored: boolean
  isChosen: boolean
  dateSetting: DateSettingType
  testCase: SelectOptionType[]
  tlm: RequestTlmType[]
} & PjSettingType

export type TlmDataObjectType = {
  tlm: {
    [key: string]: {
      time: TlmDataType[]
      data: TlmDataType[]
    }
  }
  warningMessages: string[]
}

const mode = ['orbit', 'ground'] as const
export type Mode = typeof mode[number]

export type QuerySuccess<T> = { success: true; data: T }
export type QueryError = { success: false; error: string }
export type QueryReturnType<T> = QuerySuccess<T> | QueryError
export type ApiReturnType<T> = QueryReturnType<T>

const regexGroundTestDateTime =
  /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) ([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/
// /^[0-9]{4}(-|\/)(0?[1-9]|1[0-2])(-|\/)(0?[1-9]|[12][0-9]|3[01]) ([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/
export const groundDateTimeTypeSchema = z.string().regex(regexGroundTestDateTime)

export const groundDataTypeSchema = z.union([z.number().nullable(), groundDateTimeTypeSchema])
export const groundObjectTypeSchema = z.record(groundDataTypeSchema)

export const groundArrayObjectTypeSchema = z.array(groundObjectTypeSchema)
export const groundObjectArrayTypeSchema = z.record(z.array(groundDataTypeSchema))
export const groundObjectArrayIncludingDateTimeTypeSchema = z
  .object({ DATE: z.array(z.string()) })
  .and(groundObjectArrayTypeSchema)

const regexOrbitDateTime =
  /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9].[0-9]{3}Z/
export const orbitDateTimeTypeSchema = z
  .object({ value: z.string().regex(regexOrbitDateTime) })
  .transform((e) => e.value.replace('T', ' ').replace('.000Z', ''))

export const orbitDataTypeSchema = z.union([z.number().nullable(), orbitDateTimeTypeSchema])
export const orbitObjectTypeSchema = z.record(orbitDataTypeSchema)

export const orbitArrayObjectTypeSchema = z.array(orbitObjectTypeSchema)
export const orbitObjectArrayTypeSchema = z.record(z.array(orbitDataTypeSchema))
export const orbitObjectArrayIncludingDateTimeTypeSchema = z
  .object({
    OBCTimeUTC: z.array(orbitDateTimeTypeSchema),
    CalibratedOBCTimeUTC: z.array(orbitDateTimeTypeSchema),
  })
  .and(orbitObjectArrayTypeSchema)

export type DateTimeType = {
  orbit: z.infer<typeof orbitDateTimeTypeSchema>
  ground: z.infer<typeof groundDateTimeTypeSchema>
}
export type DataType = {
  orbit: z.infer<typeof orbitDataTypeSchema>
  ground: z.infer<typeof groundDataTypeSchema>
}
export type ArrayObjectType = {
  orbit: z.infer<typeof orbitArrayObjectTypeSchema>
  ground: z.infer<typeof groundArrayObjectTypeSchema>
}
export type ObjectArrayType = {
  orbit: z.infer<typeof orbitObjectArrayTypeSchema>
  ground: z.infer<typeof groundObjectArrayTypeSchema>
}
export type ObjectArrayIncludingDateTimeType = {
  orbit: z.infer<typeof orbitObjectArrayIncludingDateTimeTypeSchema>
  ground: z.infer<typeof groundObjectArrayIncludingDateTimeTypeSchema>
}

export type ResponseDataType = {
  success: boolean
  tlm: {
    time: string[]
    data: {
      [key: string]: (number | null)[]
    }
  }
  errorMessages: string[]
}

export type GraphDataType = {
  tlmName: string
  x: string[]
  y: (number | null)[]
}

export type GraphDataEachPlotIdType = {
  plotId: number
  tlm: GraphDataType[]
}

export type GraphDataArrayType = GraphDataEachPlotIdType[]

export type TlmDataType = string | number | null
export type CsvDataType = {
  Time: TlmDataType
  [key: string]: TlmDataType
}

export type AxisType = {
  x: {
    max: string | undefined
    min: string | undefined
    div: number | undefined
  }
  y: {
    max: number | undefined
    min: number | undefined
    div: number | undefined
  }
}

export const regexGraphDateTime =
  /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) ([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
export const dateGraphSchema = z.string().regex(regexGraphDateTime)

export const signList = ['==', '!=', '>', '>=', '<', '<='] as const
export type SignType = typeof signList[number]
export type TlmObject = {
  Time: string
  [key: string]: string | number | null
}
export type TlmObjectArray = {
  Time: string[]
  [key: string]: (string | number | null)[]
}
