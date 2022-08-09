import type { MutableRefObject } from 'react'
import { useEffect } from 'react'

export const useResizeObserver = (element: MutableRefObject<null>, callback: (...args: unknown[]) => unknown) => {
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      callback(entries)
    })

    if (element.current) resizeObserver.observe(element.current)

    return () => resizeObserver.disconnect()
  }, [])
}
