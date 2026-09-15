// beui.dev lib/hooks/use-hover-gesture
import { useRef } from 'react'
import { isHoveringPointer } from '../touch'

type BoundaryEvent = { pointerId: number; pointerType: string; buttons: number }

export type HoverGesture = {
  /** True when this enter starts a hover: the pointer arrived resting, not pressing. */
  enter: (event: BoundaryEvent) => boolean
  /** True when this leave ends a hover that entered as one. */
  leave: (event: BoundaryEvent) => boolean
}

/**
 * Pairs a surface's enter with its leave, per pointer. A pointer that arrived in contact
 * (pen or finger) never started a hover, so its leave must not tear one down.
 */
export const useHoverGesture = (): HoverGesture => {
  const contact = useRef(new Set<number>())

  return {
    enter: (event) => {
      if (isHoveringPointer(event)) {
        contact.current.delete(event.pointerId)
        return true
      }
      contact.current.add(event.pointerId)
      return false
    },
    leave: (event) => {
      const arrivedInContact = contact.current.delete(event.pointerId)
      return !arrivedInContact && event.pointerType !== 'touch'
    },
  }
}
