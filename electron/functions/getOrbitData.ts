import { BigQuery } from '@google-cloud/bigquery'

import { orbitArrayObjectTypeSchema } from '../../types'
import { getStringFromDateFixedTime, MAX_DAY, trimQuery, uniqueArray } from './getDbDataCommon'

import type {
  RequestDataType,
  QueryReturnType,
  ArrayObjectType,
  ObjectArrayIncludingDateTimeType,
  ResponseDataType,
} from '../../types'

const OBCTIME_INITIAL = '2016-1-1 00:00:00 UTC'

const toObjectArrayOrbit = (records: ArrayObjectType['orbit']): ObjectArrayIncludingDateTimeType['orbit'] => {
  const objectArray: ObjectArrayIncludingDateTimeType['orbit'] = { OBCTimeUTC: [], CalibratedOBCTimeUTC: [] }
  const keys = Object.keys(records[0] ?? {})

  keys.forEach((key) => {
    objectArray[key] = []
  })

  records.forEach((record) => {
    keys.forEach((key) => {
      objectArray[key]?.push(record[key] ?? null)
    })
  })
  return objectArray
}

const readOrbitDbSync = (
  path: string,
  query: string
): Promise<QueryReturnType<ObjectArrayIncludingDateTimeType['orbit']>> => {
  const bigqueryInstance = new BigQuery({
    keyFilename: path,
  })

  return bigqueryInstance
    .query(query)
    .then((data) => {
      const schemaResult = orbitArrayObjectTypeSchema.safeParse(data[0])
      if (schemaResult.success) {
        const convertedData = toObjectArrayOrbit(schemaResult.data)
        if (convertedData)
          return {
            success: true,
            data: convertedData,
          } as const

        return {
          success: false,
          error: `Cannot convert from arrayObject to objectArray`,
        } as const
      }

      return {
        success: false,
        error: `${JSON.stringify(schemaResult.error.issues[0])}`,
      } as const
    })
    .catch(
      (err) =>
        ({
          success: false,
          error: `${JSON.stringify(err.errors[0])}`,
        } as const)
    )
}

export const getOrbitData = async (
  request: RequestDataType,
  bigquerySettingPath: string | null
): Promise<ResponseDataType> => {
  if (bigquerySettingPath) {
    const { orbitDatasetPath, isStored, dateSetting, tlm } = request
    const startDateStr = getStringFromDateFixedTime(dateSetting.startDate, '00:00:00')
    const endDateStr = getStringFromDateFixedTime(dateSetting.endDate, '23:59:59')

    const startDatePlusMaxDay = new Date(dateSetting.startDate.setDate(dateSetting.startDate.getDate() + MAX_DAY - 1))
    const responseData: ResponseDataType = {
      success: true,
      tlm: { time: [], data: {} },
      errorMessages: [],
    }

    if (startDatePlusMaxDay < dateSetting.endDate) {
      responseData.success = false
      responseData.errorMessages.push(`Data too big (more than ${MAX_DAY} days)`)
      return responseData
    }

    const queryWith = trimQuery(
      tlm.reduce((prevQuery, currentElement) => {
        const datasetTableQuery =
          currentElement.tlmId !== 0
            ? `\n(tab)(tab)\`${orbitDatasetPath}.tlm_id_${currentElement.tlmId}\``
            : `\n(tab)(tab)\`${orbitDatasetPath}.tlm_header\``
        const tlmListQuery = currentElement.tlmList.reduce(
          (prev, current) => `${prev}\n(tab)(tab)${current},`,
          `
          (tab)(tab)OBCTimeUTC,
          (tab)(tab)CalibratedOBCTimeUTC,
          `
        )
        const whereQuery = `
        (tab)(tab)CalibratedOBCTimeUTC > '${OBCTIME_INITIAL}'
        (tab)(tab)AND OBCTimeUTC BETWEEN '${startDateStr}' AND '${endDateStr}'
        ${isStored ? '(tab)(tab)AND Stored = True' : '(tab)(tab)AND Stored = False'}
        `

        return `${prevQuery}
            (tab)id${currentElement.tlmId} as (
            (tab)SELECT DISTINCT${tlmListQuery}
            (tab)FROM${datasetTableQuery}
            (tab)WHERE${whereQuery}
            (tab)ORDER BY OBCTimeUTC),
            `
      }, 'WITH\n')
    )

    const querySelectObcTime = `${trimQuery(
      tlm.reduce(
        (prevQuery, currentElement) => `${prevQuery}id${currentElement.tlmId}.OBCTimeUTC,`,
        'SELECT\n(tab)COALESCE('
      )
    )}) AS OBCTimeUTC,`
    const querySelectCalibratedObcTime = `${trimQuery(
      tlm.reduce(
        (prevQuery, currentElement) => `${prevQuery}id${currentElement.tlmId}.CalibratedOBCTimeUTC,`,
        '(tab)COALESCE('
      )
    )}) AS CalibratedOBCTimeUTC,`
    const querySelectTlm = trimQuery(
      tlm.reduce((prevQuery, currentElement) => {
        const tlmListQuery = currentElement.tlmList.reduce((prev, current) => `${prev}\n(tab)${current},`, '')
        return `${prevQuery}
    ${tlmListQuery}
   `
      }, '')
    )
    const querySelect = `${querySelectObcTime}\n${querySelectCalibratedObcTime}\n${querySelectTlm}`

    const baseId = tlm[0]?.tlmId
    const queryJoin = trimQuery(
      tlm.slice(1, tlm.length).reduce(
        (prevQuery, currentElement) => `${prevQuery}
    FULL JOIN id${currentElement.tlmId}
    (tab)ON id${baseId}.OBCTimeUTC = id${currentElement.tlmId}.OBCTimeUTC
    `,
        `FROM id${baseId}`
      )
    )

    const query = `${queryWith}\n${querySelect}\n${queryJoin}\nORDER BY OBCTimeUTC`
    const responseFromDb = await readOrbitDbSync(bigquerySettingPath, query)
    const errorMessages: string[] = []

    if (responseFromDb.success) {
      responseData.tlm.time = responseFromDb.data.OBCTimeUTC
      const tlmAllList = tlm.map((e) => e.tlmList).flat()
      tlmAllList.forEach((tlmName) => {
        const data = responseFromDb.data[tlmName]
        responseData.tlm.data[tlmName] = []
        if (data) {
          const dataNotIncludingString = data.map((d) => {
            if (typeof d === 'string') return null
            return d
          })
          responseData.tlm.data[tlmName]?.push(...dataNotIncludingString)
        }
      })
    } else if (!responseFromDb.success) {
      const error = responseFromDb.error
      errorMessages.push(error)
    }
    if (responseData.tlm.time.length === 0) {
      errorMessages.push('Empty')
      responseData.success = false
    }
    responseData.errorMessages = uniqueArray(errorMessages)
    return responseData
  }
  return {
    success: false,
    tlm: {
      time: [],
      data: {},
    },
    errorMessages: ['Not found BigQuery service account key'],
  }
}
