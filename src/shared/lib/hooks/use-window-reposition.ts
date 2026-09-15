import { useEffect, useEffectEvent } from 'react'

/** While `active`, calls `reposition` on any scroll (capture phase, so nested scrollers count) and resize. */
export const useWindowReposition = (active: boolean, reposition: () => void): void => {
  const handle = useEffectEvent(reposition)
  useEffect(() => {
    if (!active) return
    window.addEventListener('scroll', handle, true)
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
    }
  }, [active])
}
