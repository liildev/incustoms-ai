// beui.dev/components/motion/input — shake the field when an error appears
import { animate, useReducedMotion } from 'motion/react'
import { type RefObject, useEffect } from 'react'

export const useErrorShake = (ref: RefObject<HTMLElement | null>, hasError: boolean): void => {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reduce || !hasError) return
    animate(ref.current, { x: [0, -6, 6, -4, 4, -2, 0] }, { duration: 0.45 })
  }, [ref, hasError, reduce])
}
