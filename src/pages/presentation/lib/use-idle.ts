import { useEffect, useState } from 'react'

/**
 * True after `timeout` ms without pointer or focus activity while `enabled`; always false otherwise.
 * Moving focus (Tab) counts as activity, so keyboard users bring hidden controls back; presenter keys
 * such as the arrows do not.
 */
export const useIdle = (enabled: boolean, timeout: number): boolean => {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let timer = 0
    const wake = () => {
      setIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdle(true), timeout)
    }
    wake()
    const events = ['pointermove', 'pointerdown', 'focusin'] as const
    for (const name of events) window.addEventListener(name, wake)
    return () => {
      window.clearTimeout(timer)
      for (const name of events) window.removeEventListener(name, wake)
      setIdle(false)
    }
  }, [enabled, timeout])

  return enabled && idle
}
