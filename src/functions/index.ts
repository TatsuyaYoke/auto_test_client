import { MAX_DIV } from '@constants'

import type { SelectOptionType } from '@types'

export const max = (array: number[]): number | null => {
  if (array.length === 0) return null
  return array.reduce((a, b) => (a > b ? a : b))
}
export const min = (array: number[]): number | null => {
  if (array.length === 0) return null
  return array.reduce((a, b) => (a < b ? a : b))
}
export const average = (array: number[]): number | null => {
  if (array.length === 0) return null
  return array.reduce((previous, current) => previous + current) / array.length
}
export const median = (array: number[]): number | null => {
  if (array.length === 0) return null
  array.sort((a, b) => a - b)
  const half = Math.floor(array.length / 2)
  const halfArrayValue = array[half]
  const halfArrayValueBefore = array[half - 1]
  if (halfArrayValue && halfArrayValueBefore) {
    if (array.length % 2) {
      return halfArrayValue
    }
    return (halfArrayValueBefore + halfArrayValue) / 2
  }
  return null
}
export const standardDeviation = (array: number[]): number | null => {
  if (array.length === 0) return null
  const averageValue = average(array)
  if (averageValue === null) return null
  return Math.sqrt(
    array
      .map((current) => {
        const difference = current - averageValue
        return difference ** 2
      })
      .reduce((previous, current) => previous + current) / array.length
  )
}

export const stringToSelectOption = (element: string): SelectOptionType => ({
  label: element,
  value: element,
})

export const checkDivSetting = (
  maxValue: number | Date | undefined,
  minValue: number | Date | undefined,
  divValue: number | undefined
): { success: true } | { success: false; error: string } => {
  let maxValueCopy = 0
  let minValueCopy = 0
  if (typeof maxValue === 'number' && typeof minValue === 'number') {
    maxValueCopy = maxValue
    minValueCopy = minValue
  } else if (maxValue instanceof Date && minValue instanceof Date) {
    maxValueCopy = maxValue.getTime() / 1000
    minValueCopy = minValue.getTime() / 1000
  } else {
    return { success: false, error: 'checkDivSetting value error' } as const
  }

  if (maxValueCopy < minValueCopy) {
    return { success: false, error: 'Max < Min setting error' } as const
  }
  if (divValue && divValue > 0 && (maxValueCopy - minValueCopy) / divValue > MAX_DIV) {
    return { success: false, error: 'too many divisions error' } as const
  }
  if (divValue === 0) {
    return { success: false, error: '0 div error' } as const
  }
  return { success: true } as const
}
