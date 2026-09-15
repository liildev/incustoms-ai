// beui.dev lib/hooks/use-hover-capable
import { useEffect, useState } from 'react'

/**
 * True only on devices with a real hover (mouse or trackpad). Touch devices fire a sticky
 * `:hover` on tap, so hover-only effects are gated behind this.
 */
export const useHoverCapable = (): boolean => {
  const [canHover, setCanHover] = useState(false)

  useEffect(() => {
    if (!window.matchMedia) return
    const query = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setCanHover(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return canHover
}
