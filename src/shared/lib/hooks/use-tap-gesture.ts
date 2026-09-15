// beui.dev lib/hooks/use-tap-gesture
import { useRef } from 'react'

export type TapRecord<S> = { pointerType: string; state: S }

export type TapGesture<S> = {
  /** Record the gesture a pointerdown starts, with the state it starts in. */
  start: (event: { pointerType: string }, state: S) => void
  /** Read the record and clear it; `null` when no pointer is behind this click. */
  take: () => TapRecord<S> | null
  /** Drop the record: this gesture will never spend it on a click. */
  drop: () => void
}

/**
 * The pointer gesture behind a click. A `click` carries no `pointerType`, so the pointerdown
 * before it is the only thing that says whether a finger, a mouse or the keyboard activated it.
 */
export const useTapGesture = <S>(): TapGesture<S> => {
  const record = useRef<TapRecord<S> | null>(null)

  return {
    start: (event, state) => {
      record.current = { pointerType: event.pointerType, state }
    },
    take: () => {
      const spent = record.current
      record.current = null
      return spent
    },
    drop: () => {
      record.current = null
    },
  }
}
