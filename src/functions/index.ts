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
