import { useEffect, useEffectEvent, useRef } from 'react'
import { type DeckCommand, resolveDeckKey } from '../lib/deck-key'

const CONTROL_SELECTOR = 'button, a[href], input, select, textarea, [contenteditable="true"]'

/**
 * Global keyboard control of the deck while the presentation page is mounted. Space stays with a
 * control only if focus reached it by keyboard (Tab); after a mouse click Space advances the deck.
 * Held-down keys never repeat a fullscreen toggle.
 */
export const useDeckKeys = (run: (command: DeckCommand) => void, paged: boolean): void => {
  const focusedByKeyboard = useRef(false)

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Tab') focusedByKeyboard.current = true
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const target = event.target instanceof Element ? event.target : null
    const onControl = focusedByKeyboard.current && target?.closest(CONTROL_SELECTOR) != null
    const command = resolveDeckKey(event.key, { shiftKey: event.shiftKey, onControl, paged })
    if (!command) return
    if (event.repeat && (command === 'fullscreen' || command === 'exit-fullscreen')) return
    event.preventDefault()
    run(command)
  })

  useEffect(() => {
    const onPointerDown = () => {
      focusedByKeyboard.current = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])
}
