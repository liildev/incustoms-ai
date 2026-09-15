// beui.dev/components/motion/center-morph-modal — scroll lock, focus trap and Escape handling
import { type RefObject, useEffect, useEffectEvent, useRef } from 'react'
import { focusableIn } from '../focusable'

/**
 * While `open`: locks page scroll, moves focus into the panel, keeps Tab inside it and closes on Escape.
 * On close, focus returns to the element that was focused before opening. A modal hidden with its page and
 * shown again reopens with focus on <body>; the element saved before hiding is then kept as the target.
 */
export const useModalFocus = (
  open: boolean,
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void => {
  const close = useEffectEvent(onClose)
  const restoreTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const active = document.activeElement
    if (active instanceof HTMLElement && active !== document.body) restoreTo.current = active
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFrame = requestAnimationFrame(() => {
      const [first] = focusableIn(panelRef.current)
      ;(first ?? panelRef.current)?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = focusableIn(panelRef.current)
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) {
        event.preventDefault()
        panelRef.current?.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(focusFrame)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      const target = restoreTo.current
      target?.focus()
      // Focus fails on an element of a hidden page; keep it for the next close.
      if (document.activeElement === target) restoreTo.current = null
    }
  }, [open, panelRef])
}
