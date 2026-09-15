// beui.dev lib/hooks/use-dismiss (pass-through behavior)
import { type RefObject, useEffect } from 'react'

/**
 * Closes an open overlay on Escape or on a pointerdown outside `ref`.
 * The pointerdown listener is capture-phase, so handlers that stop propagation cannot blind it.
 */
export const useDismiss = (
  open: boolean,
  onDismiss: () => void,
  ref: RefObject<HTMLElement | null>,
): void => {
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }
    const handlePointer = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (target && !ref.current?.contains(target)) onDismiss()
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('pointerdown', handlePointer, true)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('pointerdown', handlePointer, true)
    }
  }, [open, onDismiss, ref])
}
