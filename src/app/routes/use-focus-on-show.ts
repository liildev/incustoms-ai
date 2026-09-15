import { useEffect, useRef, type RefObject } from 'react'

/** Moves focus into a kept-alive view when it becomes visible again, instead of leaving it on <body>. */
export const useFocusOnShow = (ref: RefObject<HTMLElement | null>, visible: boolean): void => {
  const wasVisible = useRef(visible)

  useEffect(() => {
    if (visible && !wasVisible.current) ref.current?.focus({ preventScroll: true })
    wasVisible.current = visible
  }, [ref, visible])
}
