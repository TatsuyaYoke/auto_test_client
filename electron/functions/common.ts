export const compare = <T extends string | number | null | undefined>(a: T, b: T, desc = true) => {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1

  if (a === undefined && b === undefined) return 0
  if (a === undefined) return 1
  if (b === undefined) return -1

  if (a === '' && b === '') return 0
  if (a === '') return 1
  if (b === '') return -1

  const sig = desc ? 1 : -1
  if (a < b) return sig
  if (a > b) return -sig
  return 0
}
