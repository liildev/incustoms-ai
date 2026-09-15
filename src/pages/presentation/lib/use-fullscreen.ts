import { useEffect, useState } from 'react'

/**
 * Fullscreen API bound to one element (pass `attach` as its ref). `active` follows the browser, so leaving
 * fullscreen with Escape is reflected too. Unmounting the element leaves fullscreen.
 */
export const useFullscreen = <T extends HTMLElement>() => {
  const [node, setNode] = useState<T | null>(null)
  const [active, setActive] = useState(false)
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled

  useEffect(() => {
    if (!node) return
    const sync = () => setActive(document.fullscreenElement === node)
    document.addEventListener('fullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      if (document.fullscreenElement === node) document.exitFullscreen().catch(() => undefined)
    }
  }, [node])

  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
  }

  const toggle = () => {
    if (!supported || !node) return
    // A refused request or exit (no user gesture, policy) leaves the current mode; nothing to recover.
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else node.requestFullscreen().catch(() => undefined)
  }

  return { attach: setNode, active, supported, toggle, exit }
}
