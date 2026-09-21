import { useEffect, useRef } from 'react'

/**
 * Keeps a ref pointed at the newest value without making the render
 * impure. The canvas surfaces use this to read fresh props inside a
 * long-lived animation callback, so the callback identity never
 * changes and the canvas is never re-wired.
 *
 * The assignment happens after commit rather than during render: a
 * render React discards under concurrent mode must not be able to
 * leak its props into the frame loop.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}
