/**
 * issue: Array.isArray type narrows to any[] for ReadonlyArray<T>
 * @see https://github.com/microsoft/TypeScript/issues/17002#issuecomment-494937708
 */
interface ArrayConstructor {
  isArray(arg: ReadonlyArray<unknown> | unknown): arg is ReadonlyArray<unknown> | Array<unknown>
}
